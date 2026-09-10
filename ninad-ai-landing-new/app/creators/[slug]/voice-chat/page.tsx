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

const CREATORS_DATA: Record<
  string,
  {
    name: string;
    image: string;
    role: string;
    influencerId: string;
    preferredProvider: string;
    pushToTalk?: boolean;
    /**
     * When true, starting a turn while the agent is still talking cuts the
     * agent off (barge-in) instead of queueing behind it. Opt-in per creator —
     * it needs backend support for the `interrupt` message to be clean.
     */
    allowInterruption?: boolean;
  }
> = {
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
    name: "Lord Ganesha",
    image: "/assets/creators/ganesha.jpg",
    role: "Guide & Guardian",
    influencerId: "ganeshji",
    preferredProvider: DEFAULT_PREFERRED_PROVIDER,
    pushToTalk: true,
    allowInterruption: true,
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
  const canInterrupt = creatorData?.allowInterruption ?? false;
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

  // Seeded from the URL's rough minute estimate; corrected to the authoritative
  // second-precision value from init_ack.trial_duration_seconds for trials.
  const [totalTimeSeconds, setTotalTimeSeconds] = useState(() =>
    durationMinutes ? getSessionDurationSeconds(durationMinutes) : 0
  );

  const [timeLeft, setTimeLeft] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // Authoritative signal from init_ack — never assumed from the URL or hardcoded.
  const [isTrialSession, setIsTrialSession] = useState(false);
  const [callPhase, setCallPhase] = useState<CallPhase>("connecting");
  const [isPttActive, setIsPttActive] = useState(false);
  // A failure the server reported over the socket (as opposed to a silent
  // drop). `retryable` comes straight from the server — on a retryable
  // failure it has already refunded the trial, so retrying costs nothing.
  const [connectionError, setConnectionError] = useState<{ message: string; retryable: boolean } | null>(null);
  // Bumping this re-runs the socket effect — the only way a reconnect ever
  // happens. There is deliberately no automatic reconnect loop.
  const [connectionAttempt, setConnectionAttempt] = useState(0);
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
  // Why the current press had to be queued, so release can say something true
  // about it rather than guessing.
  const pttPendingReasonRef = useRef<"mic" | "agent" | null>(null);
  // Interruption-enabled creators only: true from the moment the user barges in
  // until the agent's turn reaches a boundary. Everything the agent sends in
  // that window belongs to the turn the user cut off, so it gets dropped —
  // otherwise the tail of it resumes playing over the user. Deliberately has no
  // wall-clock escape hatch: if the backend ignores the interrupt and keeps
  // streaming, timing out would resume the abandoned response mid-sentence.
  const dropAgentAudioRef = useRef(false);
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

  // Barge-in: cut the agent off mid-sentence so the user can take the turn.
  // Unlike stopPlayback this keeps the AudioContext and the PlayoutBuffer alive
  // (stop() resets them for reuse) — tearing the context down and rebuilding it
  // would add latency to the response the user is about to ask for.
  const interruptAgentPlayback = useCallback(() => {
    playoutRef.current?.stop();
    ttsActiveRef.current = false;
    agentSpeakingRef.current = false;
    dropAgentAudioRef.current = true;
    setIsSpeaking(false);
    setCallPhase("listening");
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
    pttPendingRef.current = false;
    pttCapturingRef.current = false;
    pttPendingReasonRef.current = null;
    dropAgentAudioRef.current = false;
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
    if (!durationMinutes || connectionError) return;

    let disposed = false;
    let initAckReceived = false;
    // The server closes the socket right after reporting an error. Tracking
    // that here lets onclose tell an expected close apart from a real drop.
    let errorMessageReceived = false;

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

        if (isPushToTalk && pttPendingRef.current && (canInterrupt || !agentSpeakingRef.current)) {
          // The button was pressed (and is still held) before mic setup finished —
          // start capturing right now instead of dropping that first press.
          setAwaitingResponse(false);
          if (agentSpeakingRef.current) {
            interruptAgentPlayback();
            try { ws.send(JSON.stringify({ type: "interrupt" })); } catch { /* ignore */ }
          }
          try { ws.send(JSON.stringify({ type: "speech_start" })); } catch { /* ignore */ }
          micHandle.setMuted(false);
          pttPendingRef.current = false;
          pttPendingReasonRef.current = null;
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
        // Audio for a turn the user has already interrupted — drop it instead
        // of letting the agent's old answer play over their new question.
        if (dropAgentAudioRef.current) return;

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
            dropAgentAudioRef.current = false;

            // is_trial / trial_duration_seconds are the sole authority on
            // whether — and for how long — this session is a trial. The
            // duration passed in the URL was only ever a rough estimate;
            // correct the countdown to the authoritative second-precision
            // value now, rather than trusting our own guess.
            const isTrial = msg.is_trial === true;
            setIsTrialSession(isTrial);
            if (isTrial && typeof msg.trial_duration_seconds === "number") {
              const newEndTime = Date.now() + msg.trial_duration_seconds * 1000;
              sessionEndTimeRef.current = newEndTime;
              setTotalTimeSeconds(msg.trial_duration_seconds);
              setTimeLeft(msg.trial_duration_seconds);
              if (typeof window !== "undefined" && sessionStorageKey) {
                sessionStorage.setItem(sessionStorageKey, String(newEndTime));
              }
            }

            void startMic();
            return;
          }

          if (msg.type === "timeout") {
            toast.info("Session time is up.");
            handleEndCall(true);
            return;
          }

          if (msg.type === "trial_warning") {
            // Drive this off seconds_remaining generically — there may be more
            // than one warning mark, and the marks themselves may change.
            if (typeof msg.message === "string") toast.info(msg.message);
            if (typeof msg.seconds_remaining === "number") {
              const newEndTime = Date.now() + msg.seconds_remaining * 1000;
              sessionEndTimeRef.current = newEndTime;
              setTimeLeft(msg.seconds_remaining);
              if (typeof window !== "undefined" && sessionStorageKey) {
                sessionStorage.setItem(sessionStorageKey, String(newEndTime));
              }
            }
            return;
          }

          if (msg.type === "trial_ended") {
            // The server force-closes the socket right after this (with a 5s
            // grace period) — that close is expected, not a network error, so
            // we proactively tear down and redirect here rather than waiting
            // for it. Landing back on the profile page re-fetches
            // /trial/status, which flips the affordance to "used" and shows
            // the normal purchase flow.
            toast.info(msg.message || `Your free trial with ${creatorName} has ended. Purchase a session to continue.`);
            handleEndCall();
            return;
          }

          if (msg.type === "error" || typeof msg.error === "string") {
            errorMessageReceived = true;
            setAwaitingResponse(false);
            const errMsg: string = msg.error || msg.message || "An error occurred.";

            // Branch on the `retryable` flag and on whether the session had
            // already been accepted — never on the wording of the message.
            // A failure after init_ack means the session was accepted and
            // then broke, so bouncing the user to the purchase flow would be
            // wrong: on a retryable failure the backend has refunded the
            // trial, and either way only /trial/status can say what's left.
            if (msg.retryable === true || initAckReceived) {
              stopSessionResources();
              setIsSpeaking(false);
              setIsTrialSession(false);
              setCallPhase("connecting");
              setConnectionError({ message: errMsg, retryable: msg.retryable === true });
              return;
            }

            // Pre-session errors — existing handling, unchanged.
            const lower = errMsg.toLowerCase();
            if (lower.includes("trial") && lower.includes("used")) {
              toast.error(`You've already used your free trial with ${creatorName}. Purchase a session to continue.`);
              handleEndCall();
            } else if (lower.includes("no active booking")) {
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
            // A response that starts while the user is already mid-hold answers
            // the turn they just interrupted — talking over them now would undo
            // the barge-in, so drop it and re-assert the interrupt.
            if (canInterrupt && pttCapturingRef.current) {
              dropAgentAudioRef.current = true;
              try { ws.send(JSON.stringify({ type: "interrupt" })); } catch { /* ignore */ }
              return;
            }
            dropAgentAudioRef.current = false;
            ttsActiveRef.current = true;
            setIsSpeaking(true);
            setAwaitingResponse(false);
            setCallPhase("speaking");
          }
          if (msg.type === "tts_end") {
            // Turn boundary: whatever the user interrupted is fully drained, so
            // the next response is safe to play again.
            dropAgentAudioRef.current = false;
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
            // Same as tts_start: never mute the user mid-hold to make room for
            // the answer to the turn they just cut off.
            if (canInterrupt && pttCapturingRef.current) {
              dropAgentAudioRef.current = true;
              try { ws.send(JSON.stringify({ type: "interrupt" })); } catch { /* ignore */ }
              return;
            }
            dropAgentAudioRef.current = false;
            agentSpeakingRef.current = true;
            setAwaitingResponse(false);
            micControllerRef.current?.setMuted(true);
          }
          if (msg.type === "AgentAudioDone") {
            dropAgentAudioRef.current = false;
            agentSpeakingRef.current = false;
            // Push-to-talk creators stay muted until the button is held again;
            // auto-unmuting here would silently reopen the mic between turns.
            if (!isPushToTalk) {
              micControllerRef.current?.setMuted(false);
            } else if (pttPendingRef.current && micControllerRef.current) {
              // The button was pressed (and is still held) while the agent was
              // still talking — start capturing now that it's actually safe to,
              // instead of unmuting into the agent's own playback (echo).
              // Interruption-enabled creators never reach this: the press cut
              // the agent off at the moment it happened.
              try { ws.send(JSON.stringify({ type: "speech_start" })); } catch { /* ignore */ }
              micControllerRef.current.setMuted(false);
              pttPendingRef.current = false;
              pttPendingReasonRef.current = null;
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
      // Expected: the server always closes straight after an error message,
      // which the handler above has already turned into a Retry screen.
      // Anything else is a genuine drop and keeps the existing handling.
      if (errorMessageReceived) return;
      setCallPhase("connecting");
    };

    return () => {
      disposed = true;
      stopSessionResources();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorInfluencerId, durationMinutes, preferredProvider, isPushToTalk, canInterrupt, interruptAgentPlayback, processBinaryChunk, stopSessionResources, connectionAttempt, connectionError]);

  useEffect(() => {
    if (!durationMinutes || !sessionStorageKey || connectionError) return;

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
    // connectionError pauses the countdown while the Retry screen is up, so a
    // failed attempt can't quietly burn the clock; clearing it resumes.
  }, [durationMinutes, handleEndCall, sessionStorageKey, connectionError]);

  const handleRetryConnection = useCallback(() => {
    setConnectionError(null);
    setIsSpeaking(false);
    setCallPhase("connecting");
    setAwaitingResponse(false);
    setConnectionAttempt((attempt) => attempt + 1);
  }, [setAwaitingResponse]);

  const handlePttPress = useCallback(() => {
    setIsPttActive(true);

    const mic = micControllerRef.current;
    // Barge-in: for creators that allow it, pressing while the agent is talking
    // cuts the agent off and takes the turn immediately. Everyone else queues
    // behind it as before.
    //
    // Both turn-marker families count as "the agent has the floor" —
    // AgentAudioStart/Done and tts_start/tts_end — since which one the backend
    // emits depends on the provider, and missing one would silently skip the
    // barge-in.
    const interrupting = canInterrupt && (agentSpeakingRef.current || ttsActiveRef.current);

    if (!mic || (agentSpeakingRef.current && !canInterrupt)) {
      // Mic setup hasn't finished yet, or the agent is still talking and this
      // creator can't be interrupted — queue the press and start capturing the
      // instant it's safe (see startMic / AgentAudioDone), instead of unmuting
      // into the agent's own playback (which the mic would pick up as echo).
      // Note: a pending "thinking" state deliberately does NOT block a new
      // press — the user must always be able to talk, even if a response never
      // arrives.
      pttPendingReasonRef.current = mic ? "agent" : "mic";
      pttPendingRef.current = true;
      return;
    }

    setAwaitingResponse(false);

    const ws = wsRef.current;
    if (interrupting) {
      // Silence the agent locally *before* opening the mic, so the tail of its
      // own voice can't be captured back as the user's question, and tell the
      // server to abandon the rest of the turn.
      interruptAgentPlayback();
      if (ws && ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ type: "interrupt" })); } catch { /* ignore */ }
      }
    }

    // Tell the server the turn is starting immediately, rather than waiting for
    // the VAD energy threshold to notice speech a beat later.
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify({ type: "speech_start" })); } catch { /* ignore */ }
    }
    mic.setMuted(false);
    pttCapturingRef.current = true;
  }, [canInterrupt, interruptAgentPlayback, setAwaitingResponse]);

  const handlePttRelease = useCallback(() => {
    const wasPending = pttPendingRef.current;
    const pendingReason = pttPendingReasonRef.current;
    pttPendingRef.current = false;
    pttPendingReasonRef.current = null;
    setIsPttActive(false);

    if (!pttCapturingRef.current) {
      // This hold never actually got to capture anything — it was pressed and
      // released entirely while the session was still busy. Say so, instead of
      // the press silently vanishing with nothing to show for it.
      if (wasPending) {
        toast.info(
          pendingReason === "mic"
            ? "Still getting your mic ready — hold again in a moment."
            : `${creatorName} is still finishing up — hold again in a moment.`
        );
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
  }, [creatorName, setAwaitingResponse]);

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

  if (connectionError) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#0F0F13] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <Aurora colorStops={["#0B132B", "#6366f1", "#ec4899"]} blend={0.5} amplitude={0.8} speed={0.5} />
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-black/50 backdrop-blur-xl p-8 text-center">
            <h1 className="text-2xl font-bold">
              {connectionError.retryable ? `Couldn't connect to ${creatorName}` : "Something went wrong"}
            </h1>
            <p className="mt-3 text-sm text-white/60">
              {connectionError.retryable
                ? connectionError.message
                : "The session ended unexpectedly. You can try again."}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleRetryConnection}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => handleEndCall()}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/15 bg-white/5 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Back To Creator
              </button>
            </div>
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
          totalTime={totalTimeSeconds}
          creatorName={creatorName}
          creatorImage={creatorImage}
          pushToTalk={isPushToTalk}
          isPttActive={isPttActive}
          onPttPress={handlePttPress}
          onPttRelease={handlePttRelease}
          isAwaitingResponse={isAwaitingResponse}
          isTrialSession={isTrialSession}
        />
      </div>

      <p className="pointer-events-none fixed bottom-12 left-1/2 z-110 -translate-x-1/2 text-[10px] font-normal tracking-wide text-white/60 sm:bottom-14 sm:text-[11px]">
        Ninad AI can make mistakes.
      </p>
    </main>
  );
}
