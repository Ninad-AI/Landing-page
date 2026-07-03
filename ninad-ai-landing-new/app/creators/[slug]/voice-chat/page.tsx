"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "../../../components/ProtectedRoute";
import CreatorVoiceSessionUI from "../../../components/CreatorVoiceSessionUI";
import Aurora from "../../../components/ui/Aurora";
import { startStreamingMic, type StreamingMicHandle } from "../../../lib/audioUtils";
import { PlayoutBuffer } from "../../../lib/playbackUtils";
import { buildVoiceWsUrl } from "../../../lib/config";
import { openAppWebSocket } from "../../../lib/websocket";

const DEFAULT_PREFERRED_PROVIDER = "deepgram";

type CallPhase = "connecting" | "listening" | "speaking";

function getSessionDurationSeconds(durationMinutes: number): number {
  return durationMinutes * 60;
}

const CREATORS_DATA: Record<string, { name: string; image: string; role: string; influencerId: string; preferredProvider: string }> = {
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
  const bookingId = searchParams.get("booking_id");

  const isFreeSession = searchParams.get("free") === "true";

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
  const speechFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const clearSpeechFallbackTimeout = useCallback(() => {
    if (speechFallbackTimeoutRef.current) {
      clearTimeout(speechFallbackTimeoutRef.current);
      speechFallbackTimeoutRef.current = null;
    }
  }, []);

  const scheduleSpeakingFallback = useCallback(() => {
    clearSpeechFallbackTimeout();
    speechFallbackTimeoutRef.current = setTimeout(() => {
      ttsActiveRef.current = false;
      setIsSpeaking(false);
      setCallPhase("listening");
    }, 1200);
  }, [clearSpeechFallbackTimeout]);

  const clearPersistedSession = useCallback(() => {
    sessionEndTimeRef.current = null;
    if (typeof window !== "undefined" && sessionStorageKey) {
      sessionStorage.removeItem(sessionStorageKey);
    }
  }, [sessionStorageKey]);

  const stopSessionResources = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    micControllerRef.current?.stop();
    micControllerRef.current = null;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try { wsRef.current.send(JSON.stringify({ type: "close" })); } catch { /* ignore */ }
      wsRef.current.close();
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      wsRef.current.close();
    }
    wsRef.current = null;
    ttsActiveRef.current = false;
    agentSpeakingRef.current = false;
    clearSpeechFallbackTimeout();
    stopPlayback();
  }, [clearSpeechFallbackTimeout, stopPlayback]);

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
    const redirectPath = isFreeSession
      ? `/creators/${slug}?freeSessionEnded=true`
      : `/creators/${slug}`;
    endSessionAndRedirect(redirectPath, expired);
  }, [endSessionAndRedirect, isFreeSession, slug]);

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

    const wsUrl = buildVoiceWsUrl(creatorInfluencerId);
    const authToken = typeof window !== "undefined" ? localStorage.getItem("ninad_access_token") : null;

    const ws = openAppWebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      if (disposed) return;
      clearSpeechFallbackTimeout();
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

        micControllerRef.current = micHandle;
      } catch {
        // mic failed
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        ttsActiveRef.current = true;
        setIsSpeaking(true);
        setCallPhase("speaking");
        scheduleSpeakingFallback();
        processBinaryChunk(event.data);
      } else {
        try {
          const msg = JSON.parse(event.data as string);

          if (msg.type === "init_ack") {
            // Server confirmed session — now begin audio streaming
            if (msg.is_trial && msg.trial_duration_seconds) {
              const newEndTime = Date.now() + msg.trial_duration_seconds * 1000;
              sessionEndTimeRef.current = newEndTime;
              setTimeLeft(msg.trial_duration_seconds);
              if (typeof window !== "undefined" && sessionStorageKey) {
                sessionStorage.setItem(sessionStorageKey, String(newEndTime));
              }
            }
            initAckReceived = true;
            setCallPhase("listening");
            ttsActiveRef.current = false;
            void startMic();
            return;
          }

          if (msg.type === "trial_warning") {
            toast.warning(msg.message || "Your free trial ends in 10 seconds.");
            return;
          }

          if (msg.type === "trial_ended") {
            toast.error(msg.message || "Free trial session ended. Purchase a session to continue.");
            handleEndCall(true);
            return;
          }

          if (msg.type === "timeout") {
            toast.info("Session time is up.");
            handleEndCall(true);
            return;
          }

          if (msg.type === "error") {
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
            setCallPhase("speaking");
            scheduleSpeakingFallback();
          }
          if (msg.type === "tts_end") {
            const pending = [...sourceEndPromisesRef.current];
            const done = () => {
              clearSpeechFallbackTimeout();
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
            micControllerRef.current?.setMuted(true);
          }
          if (msg.type === "AgentAudioDone") {
            agentSpeakingRef.current = false;
            micControllerRef.current?.setMuted(false);
          }
        } catch {
          // non-JSON
        }
      }
    };

    ws.onerror = () => {
      if (!disposed) {
        clearSpeechFallbackTimeout();
        setCallPhase("connecting");
      }
    };

    ws.onclose = () => {
      if (disposed) return;
      clearSpeechFallbackTimeout();
      setIsSpeaking(false);
      setCallPhase("connecting");
    };

    return () => {
      disposed = true;
      stopSessionResources();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clearSpeechFallbackTimeout, creatorInfluencerId, durationMinutes, preferredProvider, processBinaryChunk, scheduleSpeakingFallback, stopSessionResources]);

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
        />
      </div>

      <p className="pointer-events-none fixed bottom-12 left-1/2 z-110 -translate-x-1/2 text-[10px] font-normal tracking-wide text-white/60 sm:bottom-14 sm:text-[11px]">
        Ninad AI can make mistakes.
      </p>
    </main>
  );
}
