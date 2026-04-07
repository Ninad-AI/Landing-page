"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "../../../components/ProtectedRoute";
import CreatorVoiceSessionUI from "../../../components/CreatorVoiceSessionUI";
import Aurora from "../../../components/ui/Aurora";
import { startStreamingMic, type StreamingMicHandle } from "../../../lib/audioUtils";
import { buildVoiceWsUrl } from "../../../lib/config";
import { openAppWebSocket } from "../../../lib/websocket";

// Defaults for quick testing
const DEFAULT_INFLUENCER_ID = "influencer_8";
const DEFAULT_PREFERRED_PROVIDER = "deepgram";

type CallPhase = "connecting" | "listening" | "speaking";

const CREATORS_DATA: Record<string, { name: string; image: string; role: string; influencerId: string; preferredProvider: string }> = {
  "pawan-kumar": {
    name: "Pawan Kumar",
    image: "/assets/creators/pavan.png",
    role: "Influencer & Actor",
    influencerId: DEFAULT_INFLUENCER_ID,
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
  const creatorInfluencerId = creatorData?.influencerId ?? DEFAULT_INFLUENCER_ID;
  const preferredProvider = creatorData?.preferredProvider ?? DEFAULT_PREFERRED_PROVIDER;
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

  const totalTime = durationMinutes ? durationMinutes * 60 : 0;

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
  const sessionEndTimeRef = useRef<number | null>(null);
  const speechFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new Ctor();
      playHeadRef.current = audioContextRef.current.currentTime;
      sourceEndPromisesRef.current = [];
    }
    return audioContextRef.current;
  }, []);

  const scheduleBuffer = useCallback((buffer: AudioBuffer) => {
    const ctx = getAudioContext();
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);
    const p = new Promise<void>((resolve) => {
      src.onended = () => {
        sourceNodesRef.current = sourceNodesRef.current.filter((n) => n !== src);
        resolve();
      };
    });
    sourceEndPromisesRef.current.push(p);
    sourceNodesRef.current.push(src);
    if (playHeadRef.current < ctx.currentTime) playHeadRef.current = ctx.currentTime;
    src.start(playHeadRef.current);
    playHeadRef.current += buffer.duration;
  }, [getAudioContext]);

  const stopPlayback = useCallback(() => {
    sourceNodesRef.current.forEach((n) => {
      try {
        n.stop(0);
      } catch {
        // already stopped
      }
    });
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
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      wsRef.current.close();
    }
    wsRef.current = null;
    ttsActiveRef.current = false;
    clearSpeechFallbackTimeout();
    stopPlayback();
  }, [clearSpeechFallbackTimeout, stopPlayback]);

  const handleEndCall = useCallback((expired = false) => {
    stopSessionResources();
    clearPersistedSession();
    setTimeLeft(0);
    setIsSpeaking(false);
    setCallPhase("connecting");

    if (expired) {
      toast.info("Session duration completed.");
    }

    router.push(`/creators/${slug}`);
  }, [clearPersistedSession, router, slug, stopSessionResources]);

  const handleCloseToCreators = useCallback(() => {
    stopSessionResources();
    clearPersistedSession();
    setTimeLeft(0);
    setIsSpeaking(false);
    setCallPhase("connecting");
    router.push("/creators");
  }, [clearPersistedSession, router, stopSessionResources]);

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
          handleEndCall(true);
          return;
        }

        sessionEndTimeRef.current = parsedEndTime;
        setTimeLeft(Math.max(0, Math.ceil((parsedEndTime - now) / 1000)));
        return;
      }
    }

    const newEndTime = now + durationMinutes * 60 * 1000;
    sessionEndTimeRef.current = newEndTime;
    setTimeLeft(durationMinutes * 60);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(sessionStorageKey, String(newEndTime));
    }
  }, [clearPersistedSession, durationMinutes, handleEndCall, sessionStorageKey]);

  useEffect(() => {
    if (!durationMinutes) return;

    let disposed = false;

    setIsSpeaking(false);
    setCallPhase("connecting");

    const wsUrl = new URL(buildVoiceWsUrl(creatorInfluencerId));
    wsUrl.searchParams.set("preferred_provider", preferredProvider);
    wsUrl.searchParams.set("provider", preferredProvider);
    wsUrl.searchParams.set("creator_slug", slug);

    const authToken = typeof window !== "undefined" ? localStorage.getItem("ninad_access_token") : null;
    if (typeof window !== "undefined" && authToken) {
      wsUrl.searchParams.set("token", authToken);
    }

    const ws = openAppWebSocket(wsUrl.toString());
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = async () => {
      if (disposed) return;
      setCallPhase("listening");
      clearSpeechFallbackTimeout();
      ttsActiveRef.current = false;

      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(
            JSON.stringify({
              type: "session_init",
              action: "session_init",
              influencer_id: creatorInfluencerId,
              preferred_provider: preferredProvider,
              provider: preferredProvider,
              creator_slug: slug,
              token: authToken,
            })
          );
        } catch {
          // Ignore init-message failures; connection state handlers already cover retry UX.
        }
      }

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
  }, [clearSpeechFallbackTimeout, creatorInfluencerId, durationMinutes, preferredProvider, processBinaryChunk, scheduleSpeakingFallback, slug, stopSessionResources]);

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

      <button
        type="button"
        aria-label="Close voice chat"
        onClick={handleCloseToCreators}
        className="group fixed right-4 top-4 z-120 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/45 text-white/85 backdrop-blur-md pointer-events-auto transition-all duration-300 hover:border-red-400 hover:bg-red-500 hover:text-white sm:right-6 sm:top-6"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
        >
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <div className="relative z-10 min-h-screen">
        <CreatorVoiceSessionUI
          isSpeaking={isSpeaking}
          callPhase={callPhase}
          timeLeft={timeLeft}
          totalTime={totalTime}
          onEndCall={() => handleEndCall(false)}
          creatorName={creatorName}
          creatorImage={creatorImage}
        />
      </div>

      <p className="pointer-events-none fixed bottom-12 left-1/2 z-110 -translate-x-1/2 rounded-full border border-white/10 bg-black/35 px-3.5 py-1.5 text-[10px] font-normal tracking-wide text-white/60 backdrop-blur-sm sm:bottom-14 sm:text-[11px]">
        Ninad AI can make mistakes.
      </p>
    </main>
  );
}
