"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuthStore } from "../../lib/stores";
import { startStreamingMic, type StreamingMicHandle } from "../../lib/audioUtils";
import { PlayoutBuffer } from "../../lib/playbackUtils";
import CreatorVoiceSessionUI from "../../components/CreatorVoiceSessionUI";
import PaymentModal from "../../components/payment/PaymentModal";
import NdModal from "../../components/ui/NdModal";
import { toast } from "sonner";
import { authApi, paymentApi, feedbackApi } from "../../lib/api";
import { buildCreatorVoiceWsUrl } from "../../lib/config";
import { openAppWebSocket } from "../../lib/websocket";
import { getCreatorBySlug } from "../../lib/creators-data";
import type { AllowedDurationMinutes, FeedbackStars } from "../../lib/types";

/* ── Flow: idle → duration → auth (if needed) → active ── */
type FlowState = "idle" | "auth" | "duration" | "active";
type CallPhase = "connecting" | "listening" | "speaking";

export default function CreatorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "creator";
  const creatorData = getCreatorBySlug(slug);
  const creatorName = creatorData.name;
  const creatorImage = creatorData.image;
  const creatorRole = creatorData.role;
  const creatorBio = creatorData.bio;
  const creatorInfluencerId = creatorData.influencerId;
  const preferredProvider = creatorData.preferredProvider;

  /* ── Auth store ── */
  const { isAuthenticated, isHydrated, login: authLogin, user } = useAuthStore();

  /* ── UI state ── */
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [selectedMinutes, setSelectedMinutes] = useState<AllowedDurationMinutes | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callPhase, setCallPhase] = useState<CallPhase>("connecting");
  const [isVisible, setIsVisible] = useState(false);

  /* ── Auth modal state ── */
  const [authLoading, setAuthLoading] = useState(false);
  const [autoStartDuration, setAutoStartDuration] = useState<AllowedDurationMinutes | null>(null);

  /* ── Feedback state ── */
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const pendingSessionRef = useRef<{ duration: AllowedDurationMinutes; bookingId?: string } | null>(null);

  /* ── Audio streaming refs ── */
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

  /* ═══════════════════════════════════════
     Effects
     ═══════════════════════════════════════ */

  // Entrance animation
  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  /* ═══════════════════════════════════════
     Audio helpers
     ═══════════════════════════════════════ */

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

  /* ═══════════════════════════════════════
     WebSocket streaming (when active)
     ═══════════════════════════════════════ */

  useEffect(() => {
    if (flowState !== "active") return;
    let disposed = false;

    setIsSpeaking(false);
    setCallPhase("connecting");

    const wsUrl = buildCreatorVoiceWsUrl(creatorInfluencerId);
    const authToken = typeof window !== "undefined" ? localStorage.getItem("ninad_access_token") : null;

    const ws = openAppWebSocket(wsUrl);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    ws.onopen = () => {
      if (disposed) return;

      // Send init message immediately — mic streaming starts only after init_ack
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
        processBinaryChunk(event.data);
      } else {
        try {
          const msg = JSON.parse(event.data as string);

          if (msg.type === "init_ack") {
            // Server confirmed session — now begin audio streaming
            setCallPhase("listening");
            ttsActiveRef.current = false;
            void startMic();
            return;
          }

          if (msg.type === "timeout") {
            toast.info("Session time is up.");
            handleEndCall();
            return;
          }

          if (msg.type === "error") {
            const errMsg: string = msg.error || msg.message || "An error occurred.";
            const lower = errMsg.toLowerCase();
            if (lower.includes("no active booking")) {
              toast.error("No active booking found. Please purchase a session.");
            } else if (lower.includes("capacity") || lower.includes("full capacity")) {
              toast.error("All sessions are at capacity. Please try again later.");
            } else if (lower.includes("authentication required")) {
              toast.error("Authentication required. Please sign in.");
            } else {
              toast.error(errMsg);
            }
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
            handleEndCall();
            return;
          }

          if (msg.type === "tts_start") {
            ttsActiveRef.current = true;
            setIsSpeaking(true);
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
        setCallPhase("connecting");
        toast.error("Unable to connect to voice server. Please try again.");
      }
    };

    ws.onclose = () => {
      if (disposed) return;
      setIsSpeaking(false);
      setCallPhase("connecting");
    };

    return () => {
      disposed = true;
      micControllerRef.current?.stop();
      micControllerRef.current = null;
      if (ws.readyState === WebSocket.OPEN) {
        try { ws.send(JSON.stringify({ type: "close" })); } catch { /* ignore */ }
        ws.close();
      } else if (ws.readyState === WebSocket.CONNECTING) {
        // Defer close until the handshake finishes to avoid the
        // "WebSocket is closed before the connection is established" console error.
        ws.onopen = () => {
          try { ws.close(); } catch { /* ignore */ }
        };
      }
      wsRef.current = null;
      ttsActiveRef.current = false;
      agentSpeakingRef.current = false;
      stopPlayback();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creatorInfluencerId, flowState, preferredProvider, processBinaryChunk, stopPlayback]);

  const handleEndCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    micControllerRef.current?.stop();
    micControllerRef.current = null;
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      try { ws.send(JSON.stringify({ type: "close" })); } catch { /* ignore */ }
      ws.close();
    } else if (ws && ws.readyState === WebSocket.CONNECTING) {
      // Defer close until the handshake finishes to avoid the
      // "WebSocket is closed before the connection is established" console error.
      ws.onopen = () => {
        try { ws.close(); } catch { /* ignore */ }
      };
    }
    wsRef.current = null;
    stopPlayback();
    ttsActiveRef.current = false;
    agentSpeakingRef.current = false;
    setFlowState("idle");
    setTimeLeft(0);
    setSelectedMinutes(null);
    setIsSpeaking(false);
    setCallPhase("connecting");
  }, [stopPlayback]);

  /* ═══════════════════════════════════════
     Countdown timer
     ═══════════════════════════════════════ */

  useEffect(() => {
    if (flowState !== "active" || timeLeft <= 0) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleEndCall();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [flowState, timeLeft, handleEndCall]);

  /* ═══════════════════════════════════════
     Handlers
     ═══════════════════════════════════════ */

  const redirectToSession = (durationMinutes: number, bookingId?: string) => {
    const query = new URLSearchParams({ duration: String(durationMinutes) });
    if (bookingId) query.set("booking_id", bookingId);
    router.push(`/creators/${slug}/voice-chat?${query.toString()}`);
  };

  const handleStartSession = async () => {
    setShowFeedback(false);

    if (isHydrated && isAuthenticated) {
      try {
        const activeBooking = await paymentApi.getActiveBooking();
        if (activeBooking) {
          redirectToSession(
            activeBooking.duration_minutes ?? 3,
            activeBooking.id
          );
          return;
        }
      } catch {
        // Continue to payment flow if active booking check fails
      }
    }

    setFlowState("duration");
  };

  const handleRequireAuthForPayment = (durationMinutes: AllowedDurationMinutes) => {
    pendingSessionRef.current = { duration: durationMinutes };
    setFlowState("auth");
  };

  const handleGoogleAuthSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("Google Sign-In failed: no credential received.");
      return;
    }

    setAuthLoading(true);
    try {
      const response = await authApi.googleSignIn({ id_token: idToken });
      authLogin(response.user, response.tokens.access_token);
      toast.success(`Welcome, ${response.user.name}!`);

      const pending = pendingSessionRef.current;
      pendingSessionRef.current = null;

      if (pending) {
        setAutoStartDuration(pending.duration);
        setFlowState("duration");
        return;
      }

      try {
        const activeBooking = await paymentApi.getActiveBooking();
        if (activeBooking) {
          redirectToSession(
            activeBooking.duration_minutes ?? 3,
            activeBooking.id
          );
          return;
        }
      } catch {
        // Continue to payment flow if active booking check fails
      }
      setFlowState("duration");
    } catch (error) {
      const apiError = error as { response?: { data?: { detail?: string; message?: string } } };
      const msg = apiError.response?.data?.detail || apiError.response?.data?.message || "Sign-in failed. Please try again.";
      toast.error(msg);
      setFlowState("duration");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuthError = () => {
    toast.error("Google Sign-In was cancelled or failed. Please try again.");
  };

  const handlePaymentVerified = (durationMinutes: AllowedDurationMinutes, bookingId?: string) => {
    if (isHydrated && isAuthenticated) {
      redirectToSession(durationMinutes, bookingId);
      return;
    }

    pendingSessionRef.current = { duration: durationMinutes, bookingId };
    setFlowState("auth");
  };

  const handleSubmitFeedback = async (stars: FeedbackStars, feedbackComment?: string) => {
    setIsSubmittingFeedback(true);
    setFeedbackError(null);
    try {
      await feedbackApi.submitVoiceSessionFeedback({
        user_id: user?.id ?? "",
        influencer_id: creatorInfluencerId,
        rating: stars,
        comment: feedbackComment ?? null,
      });
      toast.success("Thank you for your feedback!");
      setShowFeedback(false);
    } catch {
      setFeedbackError("Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const closeModal = () => {
    setFlowState("idle");
    setSelectedMinutes(null);
    setShowFeedback(false);
    pendingSessionRef.current = null;
    setAutoStartDuration(null);
  };

  const closeAuthModal = () => {
    pendingSessionRef.current = null;
    setFlowState("duration");
  };

  /* ═══════════════════════════════════════
     Render
     ═══════════════════════════════════════ */

  return (
    <main className="relative min-h-screen w-full bg-nd-bg text-nd-ink font-nd-sans selection:bg-nd-accent/20">
      <div className={`relative z-10 w-full min-h-screen transition-all duration-700 ease-out ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        {flowState === "active" ? (
          <CreatorVoiceSessionUI
            isSpeaking={isSpeaking}
            callPhase={callPhase}
            timeLeft={timeLeft}
            totalTime={selectedMinutes ? selectedMinutes * 60 : 0}
            creatorName={creatorName}
            creatorImage={creatorImage}
            onClose={handleEndCall}
          />
        ) : (
          <>
            {/* Mobile: full-bleed portrait banner with overlaid back button (desktop keeps the portrait in the sticky sidebar below) */}
            <div className="md:hidden relative h-[280px] w-full">
              <Image src={creatorImage} alt={creatorName} fill className="object-cover" priority sizes="100vw" />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "linear-gradient(180deg, rgba(28,26,31,.42) 0%, rgba(28,26,31,0) 34%, rgba(28,26,31,.06) 62%, var(--nd-bg) 100%)" }}
              />
              <button
                onClick={() => router.push("/creators")}
                aria-label="All creators"
                className="absolute left-4 top-[calc(env(safe-area-inset-top)+16px)] w-9 h-9 rounded-full bg-nd-bg/90 flex items-center justify-center text-nd-ink cursor-pointer"
              >
                ←
              </button>
            </div>

            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 pt-4 md:pt-32 lg:pt-36 pb-16 sm:pb-20 md:pb-24 -mt-6 md:mt-0 relative">
              <button
                onClick={() => router.push("/creators")}
                className="hidden md:inline-block mb-7 text-[13.5px] font-bold text-nd-dim hover:text-nd-ink transition-colors cursor-pointer"
              >
                ← All creators
              </button>

              <div className="grid grid-cols-1 md:grid-cols-[1.15fr_.85fr] gap-10 md:gap-16 items-start">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-nd-ink px-3 py-1.5">
                      <span className="w-[5px] h-[5px] rounded-full bg-[#7FD1A0] animate-nd-blink" />
                      <span className="text-[10px] font-extrabold tracking-wide text-nd-bg">LIVE NOW</span>
                    </span>
                    <span className="text-xs font-bold text-nd-accent bg-nd-tint px-3 py-1.5 rounded-full">
                      ✓ Voice licensed
                    </span>
                  </div>
                  <h1 className="font-display text-[42px] sm:text-[54px] md:text-[62px] leading-[1.02] tracking-tight text-nd-ink mb-2">
                    {creatorName}
                  </h1>
                  <p className="text-base font-semibold text-nd-muted mb-6">{creatorRole}</p>
                  {creatorBio && (
                    <p className="text-[16px] sm:text-[16.5px] leading-relaxed text-[#3D3945] max-w-[560px] mb-8">
                      {creatorBio}
                    </p>
                  )}

                  {/* Mobile: CTA card sits inline here (portrait already shown above); desktop shows it in the sticky sidebar instead */}
                  <div className="md:hidden mb-8">
                    <div className="rounded-[20px] bg-nd-ink text-nd-bg p-5 sm:p-6">
                      <div className="text-[13px] text-[#A8A2AE] mb-1">Voice call</div>
                      <div className="font-display text-2xl leading-tight">Pick your minutes next</div>
                      <button
                        onClick={handleStartSession}
                        className="mt-5 w-full rounded-[13px] bg-nd-bg text-nd-ink font-bold text-[15px] py-4 flex items-center justify-center gap-2 hover:bg-nd-tint transition-colors cursor-pointer"
                      >
                        <span className="w-2 h-2 rounded-full bg-[#5F7A63]" />
                        Start voice chat
                      </button>
                      <p className="text-[11.5px] text-[#6F6878] mt-3 text-center leading-relaxed">
                        No subscription. Call ends when the timer does.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-nd-tint px-5 py-4 max-w-[560px]">
                    <p className="text-[13px] leading-relaxed text-nd-accent-dark">
                      <strong className="font-extrabold">This is an AI persona.</strong> {creatorName.split(" ")[0]} licensed their voice and approved what it knows. It won&apos;t give medical, legal, or financial advice, and it will tell you when it doesn&apos;t know something.
                    </p>
                  </div>
                </div>

                <div className="hidden md:block md:sticky md:top-28">
                  <div className="relative w-full aspect-[4/4.4] rounded-[22px] overflow-hidden bg-nd-tint mb-4">
                    <Image src={creatorImage} alt={creatorName} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 420px" />
                  </div>
                  <div className="rounded-[20px] bg-nd-ink text-nd-bg p-5 sm:p-6">
                    <div className="text-[13px] text-[#A8A2AE] mb-1">Voice call</div>
                    <div className="font-display text-2xl leading-tight">Pick your minutes next</div>
                    <button
                      onClick={handleStartSession}
                      className="mt-5 w-full rounded-[13px] bg-nd-bg text-nd-ink font-bold text-[15px] py-4 flex items-center justify-center gap-2 hover:bg-nd-tint transition-colors cursor-pointer"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#5F7A63]" />
                      Start voice chat
                    </button>
                    <p className="text-[11.5px] text-[#6F6878] mt-3 text-center leading-relaxed">
                      No subscription. Call ends when the timer does.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {flowState === "auth" && (
        <NdModal onClose={closeAuthModal} maxWidth={420}>
          <div className="text-center mb-7">
            <h2 className="font-display text-[28px] text-nd-ink mb-1.5">Sign in to continue</h2>
            <p className="text-[13px] text-nd-dim">Connect with your Google account to start a session</p>
          </div>

          {authLoading ? (
            <div className="w-full py-4 rounded-xl bg-nd-panel border border-nd-line flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-nd-line border-t-nd-accent rounded-full animate-spin" />
              <span className="text-sm text-nd-muted">Signing you in…</span>
            </div>
          ) : (
            <div className="flex justify-center [&>div]:!w-full [&_div[role=button]]:!w-full [&_div[role=button]]:!max-w-none">
              <GoogleLogin
                onSuccess={handleGoogleAuthSuccess}
                onError={handleGoogleAuthError}
                theme="outline"
                size="large"
                shape="rectangular"
                text="continue_with"
                width="340"
                logo_alignment="left"
                useOneTap={false}
              />
            </div>
          )}

          <p className="text-center text-[11px] text-nd-dim mt-5 leading-relaxed">
            By continuing, you agree to Ninad AI&apos;s{" "}
            <a href="/terms-and-conditions" className="text-nd-muted hover:text-nd-ink underline underline-offset-2">
              Terms of Service
            </a>
            .
          </p>
        </NdModal>
      )}

      <PaymentModal
        isOpen={flowState === "duration"}
        onClose={closeModal}
        influencerId={creatorInfluencerId}
        userName={user?.name}
        userEmail={user?.email}
        providerName={preferredProvider}
        onPaymentVerified={handlePaymentVerified}
        onRequireAuth={isHydrated && !isAuthenticated ? handleRequireAuthForPayment : undefined}
        autoStartDuration={autoStartDuration}
        onAutoStartConsumed={() => setAutoStartDuration(null)}
        feedbackMode={showFeedback}
        onSubmitFeedback={handleSubmitFeedback}
        isSubmittingFeedback={isSubmittingFeedback}
        feedbackError={feedbackError}
        creatorName={creatorName}
      />
    </main>
  );
}
