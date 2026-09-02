"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "../../../components/ProtectedRoute";
import CreatorVoiceSessionUI from "../../../components/CreatorVoiceSessionUI";
import Aurora from "../../../components/ui/Aurora";
import { startStreamingMic, type StreamingMicHandle } from "../../../lib/audioUtils";
import { PlayoutBuffer } from "../../../lib/playbackUtils";
import { buildCreatorVoiceWsUrl } from "../../../lib/config";
import { openAppWebSocket } from "../../../lib/websocket";

const DEFAULT_PREFERRED_PROVIDER = "deepgram";

type CallPhase = "connecting" | "listening" | "speaking";

function getSessionDurationSeconds(durationMinutes: number): number {
  return durationMinutes * 60;
}

const CREATORS_DATA: Record<string, { name: string; image: string; role: string; influencerId: string; preferredProvider: string; pushToTalk?: boolean }> = {
  "nirupam": {
    name: "Nirupam Paritala",
    image: "/assets/creators/nirupam.jpeg",
    role: "Actor & Producer",
    influencerId: "nirupam",
    preferredProvider: DEFAULT_PREFERRED_PROVIDER,
  },
  "aneri-thakkar": {
    name: "Aneri Thakkar",
    image: "/assets/creators/aneri-2.jpg",
    role: "Coach & Influencer",
    influencerId: "aneri",
    preferredProvider: DEFAULT_PREFERRED_PROVIDER,
  },
  "anveshi-jain": {
    name: "Anveshi Jain",
    image: "/assets/creators/anveshi.jpg",
    role: "Actress & Influencer",
    influencerId: "anveshi_jain",
    preferredProvider: DEFAULT_PREFERRED_PROVIDER,
  },
  // NOTE: Beauty Khan temporarily removed from the frontend. Uncomment to re-enable.
  // "beauty-khan": {
  //   name: "Beauty Khan",
  //   image: "/assets/creators/beauty-khan.jpg",
  //   role: "Artist and Creator",
  //   influencerId: "beauty_khan",
  //   preferredProvider: DEFAULT_PREFERRED_PROVIDER,
  // },
  "sona-dey": {
    name: "Sona Dey",
    image: "/assets/creators/sona.png",
    role: "Model & Influencer",
    influencerId: "sona_dey",
    preferredProvider: DEFAULT_PREFERRED_PROVIDER,
  },
  "ganesha": {
    name: "Ganesha",
    image: "/assets/creators/ganesha.jpg",
    role: "Guide & Guardian",
    influencerId: "ganeshji",
    preferredProvider: DEFAULT_PREFERRED_PROVIDER,
    pushToTalk: true,
  },
};

export default function CreatorVoiceChatPage() {
  return (
    <ProtectedRoute>
      <VoiceChatContent />
    </ProtectedRoute>
  );
}

function VoiceChatContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = typeof params.slug === "string" ? params.slug : "creator";
  const creatorData = CREATORS_DATA[slug];
  const creatorName = creatorData?.name ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const creatorImage = creatorData?.image ?? `/assets/creators/${slug}.png`;
  const creatorInfluencerId = creatorData?.influencerId ?? "";
  const preferredProvider = creatorData?.preferredProvider ?? DEFAULT_PREFERRED_PROVIDER;
  const isPushToTalk = creatorData?.pushToTalk ?? false;
  const bookingId = searchParams.get("booking_id");

  const durationValue = searchParams.get("duration");
  const durationMinutes = useMemo(() => {
    const parsed = Number.parseInt(durationValue ?? "", 10);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
  }, [durationValue]);

  const sessionStorageKey = useMemo(() => {
    if (!durationMinutes) return null;
    const suffix = bookingId ? `booking_${bookingId}` : `slug_${slug}_duration_${durationMinutes}`;
    return `ninad_voice_session_end_${suffix}`;
  }, [bookingId, durationMinutes, slug]);

  const totalTime = durationMinutes ? getSessionDurationSeconds(durationMinutes) : 0;

  const [timeLeft, setTimeLeft] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callPhase, setCallPhase] = useState<CallPhase>("connecting");
  const [isPttActive, setIsPttActive] = useState(false);
  // Ganesha-only: true between "you released the button" and "the agent's
  // response actually starts" — the backend does a RAG lookup in that window,
  // which can take a few seconds, so the UI shouldn't just look idle.
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const micControllerRef = useRef<StreamingMicHandle | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playHeadRef = useRef(0);
  const sourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const sourceEndPromisesRef = useRef<Promise<void>[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ttsActiveRef = useRef(false);
  const agentSpeakingRef = useRef(false);
  const playoutRef = useRef<PlayoutBuffer | null>(null);
  const sessionEndTimeRef = useRef<number | null>(null);
  // True while the push-to-talk button is held but it isn't safe to capture yet
  // (mic still initializing, or the agent is still speaking) — applied the
  // instant it becomes safe.
  const pttPendingRef = useRef(false);
  // True once speech_start has actually been sent + the mic unmuted for the
  // current hold, so release only sends speech_end for holds that really started.
  const pttCapturingRef = useRef(false);
  // Ref mirror of isAwaitingResponse, readable from the [] -dep callbacks below
  // without going stale.
  const awaitingResponseRef = useRef(false);
  const awaitingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const AWAITING_RESPONSE_TIMEOUT_MS = 20_000;
  const setAwaitingResponse = useCallback((value: boolean) => {
    awaitingResponseRef.current = value;
    setIsAwaitingResponse(value);
    if (awaitingTimeoutRef.current) {
      clearTimeout(awaitingTimeoutRef.current);
      awaitingTimeoutRef.current = null;
    }
    if (value) {
      // Safety net: never let the "thinking" indicator wedge itself if the
      // backend never sends a response for this turn.
      awaitingTimeoutRef.current = setTimeout(() => {
        awaitingTimeoutRef.current = null;
        awaitingResponseRef.current = false;
        setIsAwaitingResponse(false);
      }, AWAITING_RESPONSE_TIMEOUT_MS);
    }
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new Ctor({ sampleRate: 16000 });
      playHeadRef.current = audioContextRef.current.currentTime;
      sourceEndPromisesRef.current = [];
      playoutRef.current = new PlayoutBuffer(audioContextRef.current);
    }
    return audioContextRef.current;
  }, []);

  const scheduleBuffer = useCallback((buffer: AudioBuffer) => {
    const p = playoutRef.current!.enqueue(buffer);
    sourceEndPromisesRef.current.push(p);
    p.then(() => {
      const arr = sourceEndPromisesRef.current;
      const idx = arr.indexOf(p);
      if (idx !== -1) arr.splice(idx, 1);
      if (arr.length === 0) {
        setIsSpeaking(false);
        setCallPhase("listening");
      }
    });
  }, []);

  const stopPlayback = useCallback(() => {
    playoutRef.current?.stop();
    playoutRef.current = null;
    sourceNodesRef.current = [];
    sourceEndPromisesRef.current = [];
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    playHeadRef.current = 0;
  }, []);

  const processBinaryChunk = useCallback((buf: ArrayBuffer) => {
    const i16 = new Int16Array(buf);
    const f32 = new Float32Array(i16.length);
    for (let i = 0; i < i16.length; i++) f32[i] = i16[i] / 32768;
    const ctx = getAudioContext();
    const ab = ctx.createBuffer(1, f32.length, 16000);
    ab.copyToChannel(f32, 0, 0);
    scheduleBuffer(ab);
  }, [getAudioContext, scheduleBuffer]);

  const clearPersistedSession = useCallback(() => {
    sessionEndTimeRef.current = null;
    if (typeof window !== "undefined" && sessionStorageKey) {
      sessionStorage.removeItem(sessionStorageKey);
    }
  }, [sessionStorageKey]);

  const stopSessionResources = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (awaitingTimeoutRef.current) {
      clearTimeout(awaitingTimeoutRef.current);
      awaitingTimeoutRef.current = null;
    }
    micControllerRef.current?.stop();
    micControllerRef.current = null;
    const ws = wsRef.current;
    if (ws) {
      if (ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ type: "close" })); } catch { /* ignore */ }
      }
      // Close immediately rather than deferring until a still-connecting socket
      // finishes its handshake. Deferring left a real, live second connection
      // open (visible as two websockets in the network tab) whenever this ran
      // twice in quick succession — e.g. React Strict Mode's dev-only
      // mount→cleanup→mount — with its original onmessage handler still fully
      // wired, silently double-processing real backend messages against the
      // same shared component state. A cosmetic "closed before established"
      // console warning is a fair trade for that not happening.
      try { ws.close(); } catch { /* ignore */ }
    }
    wsRef.current = null;
    ttsActiveRef.current = false;
    agentSpeakingRef.current = false;
    stopPlayback();
  }, [stopPlayback]);

  const endSessionAndRedirect = useCallback((redirectPath: string, expired = false) => {
    stopSessionResources();
    clearPersistedSession();
    setTimeLeft(0);
    setIsSpeaking(false);
    setCallPhase("connecting");

    if (expired) {
      toast.info("Session duration completed.");
    }

    router.replace(redirectPath);
  }, [clearPersistedSession, router, stopSessionResources]);

  const handleEndCall = useCallback((expired = false) => {
    endSessionAndRedirect(`/creators/${slug}`, expired);
  }, [endSessionAndRedirect, slug]);

  useEffect(() => {
    const handleVoiceChatExit = () => {
      stopSessionResources();
      clearPersistedSession();
      setTimeLeft(0);
      setIsSpeaking(false);
      setCallPhase("connecting");
    };

    window.addEventListener("ninad:voice-chat-exit", handleVoiceChatExit);

    return () => {
      window.removeEventListener("ninad:voice-chat-exit", handleVoiceChatExit);
    };
  }, [clearPersistedSession, stopSessionResources]);

  useEffect(() => {
    if (!durationMinutes || !sessionStorageKey) return;

    const now = Date.now();
    const storedValue = typeof window !== "undefined" ? sessionStorage.getItem(sessionStorageKey) : null;
    const hasStoredSession = storedValue !== null;

    if (hasStoredSession) {
      const parsedEndTime = Number.parseInt(storedValue ?? "", 10);
      if (Number.isFinite(parsedEndTime)) {
        if (parsedEndTime <= now) {
          clearPersistedSession();
          setTimeout(() => {
            handleEndCall(true);
          }, 0);
          return;
        }

        sessionEndTimeRef.current = parsedEndTime;
        setTimeout(() => {
          setTimeLeft(Math.max(0, Math.ceil((parsedEndTime - now) / 1000)));
        }, 0);
        return;
      }
    }

    const sessionDurationSeconds = getSessionDurationSeconds(durationMinutes);
    const newEndTime = now + sessionDurationSeconds * 1000;
    sessionEndTimeRef.current = newEndTime;
    setTimeout(() => {
      setTimeLeft(sessionDurationSeconds);
    }, 0);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(sessionStorageKey, String(newEndTime));
    }
  }, [clearPersistedSession, durationMinutes, handleEndCall, sessionStorageKey]);

  useEffect(() => {
    if (!durationMinutes) return;

    let disposed = false;
    let initAckReceived = false;

    const wsUrl = buildCreatorVoiceWsUrl(creatorInfluencerId);
    const authToken = typeof window !== "undefined" ? localStorage.getItem("ninad_access_token") : null;

    const ws = openAppWebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      if (disposed) return;
      ttsActiveRef.current = false;

      // Send init message — mic streaming starts only after init_ack
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(
            JSON.stringify({
              token: authToken,
              influencer_id: creatorInfluencerId,
              preferred_provider: preferredProvider,
            })
          );
        } catch {
          // Ignore init-message failures
        }
      }
    };

    const startMic = async () => {
      try {
        const micHandle = await startStreamingMic(ws, () => {}, {
          energyThreshold: 0.01,
          silenceMs: 600,
          // Push-to-talk creators drive speech_start/speech_end from the
          // button/spacebar directly (see handlePttPress/handlePttRelease) —
          // the VAD's own energy-based detection would otherwise send a second,
          // conflicting pair of turn-boundary messages for the same utterance.
          vadEnabled: !isPushToTalk,
          // Deepgram's Voice Agent decides end-of-turn by hearing silence after
          // speech. If we simply stop sending frames when the button is
          // released, it never sees that silence and never responds — so keep
          // the stream alive with zeros while muted (no real mic audio leaks).
          streamSilenceWhileMuted: isPushToTalk,
          onSpeechStart: () => {
            if (!ttsActiveRef.current) setCallPhase("listening");
          },
          onSpeechEnd: () => {
            if (!ttsActiveRef.current) setCallPhase("listening");
          },
        });

        if (disposed) {
          micHandle.stop();
          return;
        }

        if (isPushToTalk) {
          // Push-to-talk creators start muted; audio is only sent while the button is held.
          micHandle.setMuted(true);
        }

        micControllerRef.current = micHandle;

        if (isPushToTalk && pttPendingRef.current && !agentSpeakingRef.current) {
          // The button was pressed (and is still held) before mic setup finished —
          // start capturing right now instead of dropping that first press.
          setAwaitingResponse(false);
          try { ws.send(JSON.stringify({ type: "speech_start" })); } catch { /* ignore */ }
          micHandle.setMuted(false);
          pttCapturingRef.current = true;
        }
      } catch {
        // mic failed
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      // A disposed effect instance's socket may still receive in-flight
      // messages for a moment after cleanup — never let it mutate state.
      if (disposed) return;

      if (event.data instanceof ArrayBuffer) {
        ttsActiveRef.current = true;
        setIsSpeaking(true);
        setAwaitingResponse(false);
        setCallPhase("speaking");
        processBinaryChunk(event.data);
      } else {
        try {
          const msg = JSON.parse(event.data as string);

          if (msg.type === "init_ack") {
            // Server confirmed session — now begin audio streaming
            initAckReceived = true;
            setCallPhase("listening");
            ttsActiveRef.current = false;
            void startMic();
            return;
          }

          if (msg.type === "timeout") {
            toast.info("Session time is up.");
            handleEndCall(true);
            return;
          }

          if (msg.type === "error") {
            setAwaitingResponse(false);
            const errMsg: string = msg.error || msg.message || "An error occurred.";
            const lower = errMsg.toLowerCase();
            if (lower.includes("no active booking")) {
              toast.error("No active booking found. Please purchase a session.");
              handleEndCall();
            } else if (lower.includes("capacity") || lower.includes("full capacity")) {
              toast.error("All sessions are at capacity. Please try again later.");
              handleEndCall();
            } else if (lower.includes("authentication required")) {
              toast.error("Authentication required. Please sign in.");
              handleEndCall();
            } else {
              toast.error(errMsg);
              handleEndCall();
            }
            return;
          }

          if (msg.type === "tts_start") {
            ttsActiveRef.current = true;
            setIsSpeaking(true);
            setAwaitingResponse(false);
            setCallPhase("speaking");
          }
          if (msg.type === "tts_end") {
            const pending = [...sourceEndPromisesRef.current];
            const done = () => {
              ttsActiveRef.current = false;
              setIsSpeaking(false);
              setCallPhase("listening");
            };
            if (pending.length > 0) {
              Promise.all(pending).then(done);
            } else {
              done();
            }
          }

          if (msg.type === "AgentAudioStart") {
            agentSpeakingRef.current = true;
            setAwaitingResponse(false);
            micControllerRef.current?.setMuted(true);
          }
          if (msg.type === "AgentAudioDone") {
            agentSpeakingRef.current = false;
            // Push-to-talk creators stay muted until the button is held again;
            // auto-unmuting here would silently reopen the mic between turns.
            if (!isPushToTalk) {
              micControllerRef.current?.setMuted(false);
            } else if (pttPendingRef.current && micControllerRef.current) {
              // The button was pressed (and is still held) while the agent was
              // still talking — start capturing now that it's actually safe to,
              // instead of unmuting into the agent's own playback (echo).
              try { ws.send(JSON.stringify({ type: "speech_start" })); } catch { /* ignore */ }
              micControllerRef.current.setMuted(false);
              pttCapturingRef.current = true;
            }
          }
        } catch {
          // non-JSON
        }
      }
    };

    ws.onerror = () => {
      if (!disposed) {
        setCallPhase("connecting");
      }
    };

    ws.onclose = () => {
      if (disposed) return;
      setIsSpeaking(false);
      setCallPhase("connecting");
    };

    return () => {
      disposed = true;
      stopSessionResources();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorInfluencerId, durationMinutes, preferredProvider, isPushToTalk, processBinaryChunk, stopSessionResources]);

  useEffect(() => {
    if (!durationMinutes || !sessionStorageKey) return;

    const tick = () => {
      const endTimeMs = sessionEndTimeRef.current;
      if (!endTimeMs) return;

      const remainingSeconds = Math.max(0, Math.ceil((endTimeMs - Date.now()) / 1000));
      setTimeLeft(remainingSeconds);

      if (remainingSeconds <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleEndCall(true);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [durationMinutes, handleEndCall, sessionStorageKey]);

  const handlePttPress = useCallback(() => {
    setIsPttActive(true);

    if (!micControllerRef.current || agentSpeakingRef.current) {
      // Mic setup hasn't finished yet, or the agent is still talking — queue
      // the press and start capturing the instant it's safe (see startMic /
      // AgentAudioDone), instead of unmuting into the agent's own playback
      // (which the mic would pick up as echo). Note: a pending "thinking"
      // state deliberately does NOT block a new press — the user must always
      // be able to talk, even if a response never arrives.
      pttPendingRef.current = true;
      return;
    }

    setAwaitingResponse(false);

    // Tell the server the turn is starting immediately, rather than waiting for
    // the VAD energy threshold to notice speech a beat later.
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify({ type: "speech_start" })); } catch { /* ignore */ }
    }
    micControllerRef.current.setMuted(false);
    pttCapturingRef.current = true;
  }, []);

  const handlePttRelease = useCallback(() => {
    const wasPending = pttPendingRef.current;
    pttPendingRef.current = false;
    setIsPttActive(false);

    if (!pttCapturingRef.current) {
      // This hold never actually got to capture anything — it was pressed and
      // released entirely while Ganesha was still busy. Say so, instead of the
      // press silently vanishing with nothing to show for it.
      if (wasPending) {
        toast.info("Ganesha is still finishing up — hold again once he's done.");
      }
      return;
    }
    pttCapturingRef.current = false;

    // Send speech_end unconditionally on release — the button is the source of
    // truth for turn end. Leaving this to the VAD's internal isSpeaking flag can
    // miss short/quiet utterances and leave the server waiting indefinitely.
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify({ type: "speech_end" })); } catch { /* ignore */ }
    }
    micControllerRef.current?.setMuted(true);
    // The backend does a RAG lookup before the agent can respond — surface that
    // wait instead of the UI just going quiet until audio eventually arrives.
    setAwaitingResponse(true);
  }, []);

  // Ganesha-only: holding the spacebar anywhere on the page works like holding the button.
  useEffect(() => {
    if (!isPushToTalk || callPhase === 'connecting') return;

    const isTypingTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || isTypingTarget(e.target)) return;
      e.preventDefault();
      handlePttPress();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || isTypingTarget(e.target)) return;
      e.preventDefault();
      handlePttRelease();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    // Release if focus leaves the window/tab while space is held down.
    window.addEventListener('blur', handlePttRelease);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handlePttRelease);
    };
  }, [isPushToTalk, callPhase, handlePttPress, handlePttRelease]);

  if (!durationMinutes) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#0F0F13] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <Aurora colorStops={["#0B132B", "#6366f1", "#ec4899"]} blend={0.5} amplitude={0.8} speed={0.5} />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl p-8 text-center">
            <h1 className="text-2xl font-bold">Invalid Session Link</h1>
            <p className="mt-3 text-sm text-white/60">Missing or invalid duration. Please start the flow again from creator page.</p>
            <button
              onClick={() => router.push(`/creators/${slug}`)}
              className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors"
            >
              Back To Creator
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0F0F13] text-white">
      <div className="absolute inset-0 pointer-events-none">
        <Aurora colorStops={["#0B132B", "#6366f1", "#ec4899"]} blend={0.5} amplitude={0.6} speed={0.5} />
      </div>

      <div className="relative z-10 min-h-screen">
        <CreatorVoiceSessionUI
          isSpeaking={isSpeaking}
          callPhase={callPhase}
          timeLeft={timeLeft}
          totalTime={totalTime}
          creatorName={creatorName}
          creatorImage={creatorImage}
          pushToTalk={isPushToTalk}
          isPttActive={isPttActive}
          onPttPress={handlePttPress}
          onPttRelease={handlePttRelease}
          isAwaitingResponse={isAwaitingResponse}
        />
      </div>

      <p className="pointer-events-none fixed bottom-12 left-1/2 z-110 -translate-x-1/2 text-[10px] font-normal tracking-wide text-white/60 sm:bottom-14 sm:text-[11px]">
        Ninad AI can make mistakes.
      </p>
    </main>
  );
}
