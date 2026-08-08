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
import Aurora from "../../components/ui/Aurora";
import { toast } from "sonner";
import { authApi, paymentApi, feedbackApi } from "../../lib/api";
import { buildCreatorVoiceWsUrl } from "../../lib/config";
import { openAppWebSocket } from "../../lib/websocket";
import type { AllowedDurationMinutes, FeedbackStars } from "../../lib/types";

/* ── Flow: idle → duration → auth (if needed) → active ── */
type FlowState = "idle" | "auth" | "duration" | "active";
type CallPhase = "connecting" | "listening" | "speaking";

const DEFAULT_PREFERRED_PROVIDER = "deepgram";


/* ── Creator data ── */
const CREATORS_DATA: Record<string, { name: string; image: string; role: string; influencerId: string; preferredProvider: string }> = {
  "nirupam": {
    name: "Nirupam Paritala",
    image: "/assets/creators/nirupam.jpeg",
    role: "Actor & Producer",
    influencerId: "influencer_15",
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
  "beauty-khan": {
    name: "Beauty Khan",
    image: "/assets/creators/beauty-khan.jpg",
    role: "Artist and Creator",
    influencerId: "beauty_khan",
    preferredProvider: DEFAULT_PREFERRED_PROVIDER,
  },
  "sona-dey": {
    name: "Sona Dey",
    image: "/assets/creators/sona.png",
    role: "Model & Influencer",
    influencerId: "sona_dey",
    preferredProvider: DEFAULT_PREFERRED_PROVIDER,
  },
};

export default function CreatorProfilePage() {
  const router = useRouter();
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "creator";
  const creatorData = CREATORS_DATA[slug];
  const creatorName = creatorData?.name ?? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  const creatorImage = creatorData?.image ?? `/assets/creators/${slug}.png`;
  const creatorRole = creatorData?.role ?? "Creator";
  const creatorInfluencerId = creatorData?.influencerId ?? "";
  const preferredProvider = creatorData?.preferredProvider ?? DEFAULT_PREFERRED_PROVIDER;

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

  /* ── Feedback state ── */
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const pendingSessionRef = useRef<{ duration: AllowedDurationMinutes; bookingId?: string } | null>(null);

  /* ── Parallax refs ── */
  const mousePosRef = useRef({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const avatarRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // Entrance animation + mouse parallax
  useEffect(() => {
    const timeout = setTimeout(() => setIsVisible(true), 100);
    const handleMouseMove = (e: MouseEvent) => {
      mouseTargetRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      };
    };
    let frameId: number;
    const animate = () => {
      mousePosRef.current.x += (mouseTargetRef.current.x - mousePosRef.current.x) * 0.1;
      mousePosRef.current.y += (mouseTargetRef.current.y - mousePosRef.current.y) * 0.1;
      avatarRefs.current.forEach((el, i) => {
        if (!el) return;
        const m = i === 0 ? 0.5 : -1;
        el.style.transform = `translate3d(${mousePosRef.current.x * m}px, ${mousePosRef.current.y * m}px, 0)`;
      });
      frameId = requestAnimationFrame(animate);
    };
    window.addEventListener("mousemove", handleMouseMove);
    animate();
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(frameId);
    };
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
    let initAckReceived = false;

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
            initAckReceived = true;
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
      }
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
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
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try { wsRef.current.send(JSON.stringify({ type: "close" })); } catch { /* ignore */ }
      wsRef.current.close();
    } else if (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING) {
      wsRef.current.close();
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
    } else if (isHydrated && !isAuthenticated) {
      // Require sign-in before paying
      setFlowState("auth");
      return;
    }

    setFlowState("duration");
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
        redirectToSession(pending.duration, pending.bookingId);
      } else {
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
      }
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
  };

  /* ═══════════════════════════════════════
     Render
     ═══════════════════════════════════════ */

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0F0F13] text-white font-sans selection:bg-rose-500/30">
      {/* Background Aurora */}
      <div className="absolute inset-0 pointer-events-none">
        <Aurora colorStops={["#0B132B", "#6366f1", "#ec4899"]} blend={0.5} amplitude={flowState === "active" ? 0.6 : 1.0} speed={0.5} />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-10 py-14 sm:py-16 md:py-20 transition-all duration-700 ease-out ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        {flowState === "active" ? (
          <CreatorVoiceSessionUI
            isSpeaking={isSpeaking}
            callPhase={callPhase}
            timeLeft={timeLeft}
            totalTime={selectedMinutes ? selectedMinutes * 60 : 0}
            creatorName={creatorName}
            creatorImage={creatorImage}
          />
        ) : (
          <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-4 sm:gap-8 md:flex-row md:justify-between md:gap-12 lg:gap-16">
            <div className="relative z-20 flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-[11px] sm:text-sm md:text-base text-rose-300 font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-3 sm:mb-6 animate-fade-in-up">
                • {creatorRole}
              </h2>
              <h1 className="text-[2rem] sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[1.1] mix-blend-exclusion">
                <span className="block">{creatorName.split(" ")[0]}</span>
                <span className="block pb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                  {creatorName.split(" ").slice(1).join(" ")}.
                </span>
              </h1>

              <div className="animate-fade-in-up mt-8 shrink-0 hidden md:block">
                <button onClick={handleStartSession} className="group relative inline-flex items-center justify-center rounded-full bg-white text-black font-bold text-sm sm:text-base tracking-wide w-[200px] lg:w-[220px] h-12 lg:h-14 xl:h-16 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300">
                  <span className="flex items-center gap-3">
                    Start Session
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>

            <div className="relative w-[200px] h-[200px] sm:w-[280px] sm:h-[280px] md:w-[380px] md:h-[460px] lg:w-[500px] lg:h-[600px] flex-shrink-0">
              <div
                ref={(el) => { avatarRefs.current[1] = el; }}
                className="relative w-full h-full overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-700 will-change-transform"
                style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
              >
                <Image src={creatorImage} alt={creatorName} fill className="object-cover scale-110" priority quality={100} sizes="(max-width: 640px) 280px, (max-width: 768px) 380px, 500px" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
              </div>
              <div className="absolute -top-4 -right-4 sm:-top-12 sm:-right-12 w-10 h-10 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md border border-white/20 z-20 animate-float" style={{ borderRadius: "50%" }} />
              <div className="absolute bottom-12 -left-3 sm:-left-16 w-10 h-10 sm:w-32 sm:h-32 bg-rose-500/20 backdrop-blur-md border border-rose-500/20 z-20 animate-float animation-delay-2000" style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }} />
            </div>

            <div className="animate-fade-in-up mt-6 md:hidden w-full flex justify-center z-30">
              <button onClick={handleStartSession} className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-white text-black font-bold text-sm tracking-wide w-[180px] sm:w-[200px] h-12 sm:h-14 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300">
                Start Session
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {flowState === "auth" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={closeModal} />
          <div className="relative w-[92vw] max-w-[380px] sm:w-full sm:max-w-md animate-fade-in-up">
            <div className="relative bg-black/80 backdrop-blur-3xl border border-white/10 shadow-2xl px-6 sm:px-8 py-8 sm:py-10 overflow-hidden" style={{ borderRadius: "1.5rem" }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 blur-[80px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-7">
                  <h2 className="text-xl font-extrabold text-white tracking-tight mb-1">Sign in to continue</h2>
                  <p className="text-xs text-white/40 font-sans">Connect with your Google account to start a session</p>
                </div>

                {/* Google Sign-In */}
                {authLoading ? (
                  <div className="w-full py-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                    <span className="text-sm text-white/50 font-sans">Signing you in…</span>
                  </div>
                ) : (
                  <div className="flex justify-center [&>div]:!w-full [&_div[role=button]]:!w-full [&_div[role=button]]:!max-w-none">
                    <GoogleLogin
                      onSuccess={handleGoogleAuthSuccess}
                      onError={handleGoogleAuthError}
                      theme="filled_black"
                      size="large"
                      shape="rectangular"
                      text="continue_with"
                      width="340"
                      logo_alignment="left"
                      useOneTap={false}
                    />
                  </div>
                )}

                <p className="text-center text-[11px] text-white/25 mt-5 font-sans leading-relaxed">
                  By continuing, you agree to Ninad AI&apos;s{" "}
                  <a href="/terms-and-conditions" className="text-white/40 hover:text-white/60 transition-colors underline underline-offset-2">
                    Terms of Service
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <PaymentModal
        isOpen={flowState === "duration"}
        onClose={closeModal}
        influencerId={creatorInfluencerId}
        userName={user?.name}
        userEmail={user?.email}
        providerName={preferredProvider}
        onPaymentVerified={handlePaymentVerified}
        feedbackMode={showFeedback}
        onSubmitFeedback={handleSubmitFeedback}
        isSubmittingFeedback={isSubmittingFeedback}
        feedbackError={feedbackError}
        creatorName={creatorName}
      />
    </main>
  );
}
