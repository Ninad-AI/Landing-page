"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "../../../components/ProtectedRoute";
import CreatorVoiceSessionUI from "../../../components/CreatorVoiceSessionUI";
import VoiceFeedbackModal from "../../../components/VoiceFeedbackModal";
import Aurora from "../../../components/ui/Aurora";
import { startStreamingMic, type StreamingMicHandle } from "../../../lib/audioUtils";
import { buildVoiceWsUrl } from "../../../lib/config";
import { feedbackApi } from "../../../lib/api";
import { useAuthStore } from "../../../lib/stores";
import type { FeedbackStars } from "../../../lib/types";
import { openAppWebSocket } from "../../../lib/websocket";

// Defaults for quick testing
const DEFAULT_INFLUENCER_ID = "influencer_13";
const DEFAULT_PREFERRED_PROVIDER = "deepgram";

type CallPhase = "connecting" | "listening" | "speaking";

function getSessionDurationSeconds(durationMinutes: number): number {
  return durationMinutes * 60;
}

function normalizeErrorToMessage(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(value)) {
    const messages = value
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          const msg = typeof record.msg === "string" ? record.msg : null;
          const loc = Array.isArray(record.loc)
            ? record.loc
              .filter((part): part is string | number => typeof part === "string" || typeof part === "number")
              .join(".")
            : "";

          if (msg && loc) {
            return `${loc}: ${msg}`;
          }

          if (msg) {
            return msg;
          }
        }

        return null;
      })
      .filter((message): message is string => !!message);

    if (messages.length > 0) {
      return messages.join(" | ");
    }

    return null;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const message =
      normalizeErrorToMessage(record.message) ||
      normalizeErrorToMessage(record.error) ||
      normalizeErrorToMessage(record.detail) ||
      normalizeErrorToMessage(record.msg);

    if (message) {
      return message;
    }

    try {
      return JSON.stringify(record);
    } catch {
      return null;
    }
  }

  return null;
}

function getFeedbackErrorMessage(error: unknown): string {
  const apiError = error as {
    response?: {
      data?: unknown;
    };
    message?: string;
  };

  return (
    normalizeErrorToMessage(apiError.response?.data) ||
    normalizeErrorToMessage(apiError.message) ||
    (error instanceof Error ? error.message : "Unable to submit feedback right now.")
  );
}

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
  const { user } = useAuthStore();

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

  const totalTime = durationMinutes ? getSessionDurationSeconds(durationMinutes) : 0;

  const [timeLeft, setTimeLeft] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callPhase, setCallPhase] = useState<CallPhase>("connecting");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSubmitError, setFeedbackSubmitError] = useState<string | null>(null);
  const [redirectPathAfterFeedback, setRedirectPathAfterFeedback] = useState<string | null>(null);

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
  const micMutedRef = useRef(false);

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
    micMutedRef.current = false;
    setIsMicMuted(false);
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      wsRef.current.close();
    }
    wsRef.current = null;
    ttsActiveRef.current = false;
    clearSpeechFallbackTimeout();
    stopPlayback();
  }, [clearSpeechFallbackTimeout, stopPlayback]);

  const promptFeedbackAndExit = useCallback((redirectPath: string, expired = false) => {
    stopSessionResources();
    clearPersistedSession();
    setTimeLeft(0);
    setIsSpeaking(false);
    setCallPhase("connecting");
    setFeedbackSubmitError(null);
    setRedirectPathAfterFeedback(redirectPath);
    setIsFeedbackModalOpen(true);

    if (expired) {
      toast.info("Session duration completed.");
    }

  }, [clearPersistedSession, stopSessionResources]);

  const handleEndCall = useCallback((expired = false) => {
    promptFeedbackAndExit(`/creators/${slug}`, expired);
  }, [promptFeedbackAndExit, slug]);

  const handleToggleMic = useCallback(() => {
    setIsMicMuted((prev) => {
      const next = !prev;
      micMutedRef.current = next;
      micControllerRef.current?.setMuted(next);
      return next;
    });
  }, []);

  const handleSubmitFeedback = useCallback(async ({ stars, comment }: { stars: FeedbackStars; comment?: string }) => {
    const userId = user?.id?.trim();
    if (!userId) {
      const message = "Unable to submit feedback because user information is missing. Please sign in again.";
      setFeedbackSubmitError(message);
      toast.error(message);
      return;
    }

    setIsSubmittingFeedback(true);
    setFeedbackSubmitError(null);

    try {
      await feedbackApi.submitVoiceSessionFeedback({
        user_id: userId,
        influencer_id: creatorInfluencerId,
        rating: stars,
        comment: comment ?? null,
      });

      setIsFeedbackModalOpen(false);
      toast.success("Thanks for sharing your feedback.");
      router.push(redirectPathAfterFeedback ?? `/creators/${slug}`);
    } catch (error) {
      const message = getFeedbackErrorMessage(error);
      setFeedbackSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmittingFeedback(false);
    }
  }, [creatorInfluencerId, redirectPathAfterFeedback, router, slug, user?.id]);

  useEffect(() => {
    if (!isFeedbackModalOpen) return;

    stopSessionResources();
    setIsSpeaking(false);
    setCallPhase("connecting");
  }, [isFeedbackModalOpen, stopSessionResources]);

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

    const sessionDurationSeconds = getSessionDurationSeconds(durationMinutes);
    const newEndTime = now + sessionDurationSeconds * 1000;
    sessionEndTimeRef.current = newEndTime;
    setTimeLeft(sessionDurationSeconds);
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

        micHandle.setMuted(micMutedRef.current);
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

      <div className="relative z-10 min-h-screen">
        <CreatorVoiceSessionUI
          isSpeaking={isSpeaking}
          callPhase={callPhase}
          timeLeft={timeLeft}
          totalTime={totalTime}
          creatorName={creatorName}
          creatorImage={creatorImage}
          isMicMuted={isMicMuted}
          onToggleMic={handleToggleMic}
        />
      </div>

      <p className="pointer-events-none fixed bottom-12 left-1/2 z-110 -translate-x-1/2 text-[10px] font-normal tracking-wide text-white/60 sm:bottom-14 sm:text-[11px]">
        Ninad AI can make mistakes.
      </p>

      {isFeedbackModalOpen && (
        <VoiceFeedbackModal
          creatorName={creatorName}
          isSubmitting={isSubmittingFeedback}
          submitError={feedbackSubmitError}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </main>
  );
}
