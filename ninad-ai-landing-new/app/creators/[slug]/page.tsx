"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuthStore } from "../../lib/stores";
import PaymentModal from "../../components/payment/PaymentModal";
import Aurora from "../../components/ui/Aurora";
import { toast } from "sonner";
import { authApi, paymentApi, feedbackApi } from "../../lib/api";
import type { AllowedDurationMinutes, FeedbackStars } from "../../lib/types";

/* ── Flow: idle → duration → auth (if needed); a verified session
   redirects to /creators/[slug]/voice-chat ── */
type FlowState = "idle" | "auth" | "duration";

const DEFAULT_PREFERRED_PROVIDER = "deepgram";


/* ── Creator data ── */
const CREATORS_DATA: Record<
  string,
  {
    name: string;
    image: string;
    role: string;
    influencerId: string;
    preferredProvider: string;
    /**
     * Restricts the payment modal to these durations. Omit to offer every plan
     * in the price table. Must stay a stable reference — it feeds a memo.
     */
    offeredDurations?: readonly AllowedDurationMinutes[];
    /**
     * When true, a verified payment does NOT drop the user straight into the
     * call — it parks a ready-to-start booking and waits for them to press
     * Start Session, so the paid clock can't start ticking while they're still
     * getting settled.
     */
    requireManualStart?: boolean;
  }
> = {
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
  // NOTE: Beauty Khan temporarily removed from the frontend. Uncomment to re-enable.
  // "beauty-khan": {
  //   name: "Beauty Khan",
  //   image: "/assets/creators/beauty-khan.jpg",
  //   role: "Artist and Creator",
  //   influencerId: "beauty_khan",
  //   preferredProvider: DEFAULT_PREFERRED_PROVIDER,
  // },
  "ganesha": {
    name: "Lord Ganesha",
    image: "/assets/creators/ganesha.jpg",
    role: "Guide & Guardian",
    influencerId: "ganeshji",
    preferredProvider: DEFAULT_PREFERRED_PROVIDER,
    offeredDurations: [3],
    requireManualStart: true,
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
  const offeredDurations = creatorData?.offeredDurations;
  const requireManualStart = creatorData?.requireManualStart ?? false;

  /* ── Auth store ── */
  const { isAuthenticated, isHydrated, login: authLogin, user } = useAuthStore();

  /* ── UI state ── */
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [isVisible, setIsVisible] = useState(false);

  /* ── Paid and waiting: set for requireManualStart creators once checkout is
     verified, cleared when the user actually starts the session. ── */
  const [readyBooking, setReadyBooking] = useState<{ duration: AllowedDurationMinutes; bookingId?: string } | null>(null);

  /* ── Auth modal state ── */
  const [authLoading, setAuthLoading] = useState(false);
  const [autoStartDuration, setAutoStartDuration] = useState<AllowedDurationMinutes | null>(null);

  /* ── Feedback state ── */
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const pendingSessionRef = useRef<{ duration: AllowedDurationMinutes; bookingId?: string } | null>(null);

  /* ── Parallax refs ── */
  const mousePosRef = useRef({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const avatarRefs = useRef<(HTMLDivElement | null)[]>([]);

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
     Handlers
     ═══════════════════════════════════════ */

  const redirectToSession = (durationMinutes: number, bookingId?: string) => {
    const query = new URLSearchParams({ duration: String(durationMinutes) });
    if (bookingId) query.set("booking_id", bookingId);
    router.push(`/creators/${slug}/voice-chat?${query.toString()}`);
  };

  const handleStartSession = async () => {
    setShowFeedback(false);

    // Already paid for and waiting on the user's go-ahead — this press is it.
    if (readyBooking) {
      redirectToSession(readyBooking.duration, readyBooking.bookingId);
      return;
    }

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
      if (requireManualStart) {
        // Paid, but don't dial in yet — park the booking and let the Start
        // Session button be the thing that actually opens the call.
        setReadyBooking({ duration: durationMinutes, bookingId });
        toast.success("Payment confirmed. Press Start Session when you're ready.");
        return;
      }
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

  // Rendered above the CTA in both the desktop and mobile layouts.
  const renderCtaBadge = (className: string) => {
    if (!readyBooking) return null;
    return (
      <span className={`${className} inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-black shadow-[0_4px_16px_rgba(251,146,60,0.4)]`}>
        Session ready · {readyBooking.duration} min
      </span>
    );
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0F0F13] text-white font-sans selection:bg-rose-500/30">
      {/* Background Aurora */}
      <div className="absolute inset-0 pointer-events-none">
        <Aurora colorStops={["#0B132B", "#6366f1", "#ec4899"]} blend={0.5} amplitude={1.0} speed={0.5} />
      </div>

      {/* Main Content */}
      <div className={`relative z-10 w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 md:px-10 py-14 sm:py-16 md:py-20 transition-all duration-700 ease-out ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
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
              {renderCtaBadge("mb-3")}
              <button onClick={handleStartSession} className="group relative flex items-center justify-center rounded-full bg-white text-black font-bold text-sm sm:text-base tracking-wide w-[200px] lg:w-[220px] h-12 lg:h-14 xl:h-16 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300">
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

          <div className="animate-fade-in-up mt-6 md:hidden w-full flex flex-col items-center gap-3 z-30">
            {renderCtaBadge("")}
            <button onClick={handleStartSession} className="group relative inline-flex items-center justify-center gap-3 rounded-full bg-white text-black font-bold text-sm tracking-wide w-[180px] sm:w-[200px] h-12 sm:h-14 shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300">
              Start Session
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {flowState === "auth" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={closeAuthModal} />
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
                <div className="relative w-full">
                  {authLoading && (
                    <div className="absolute inset-0 z-10 w-full py-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin" />
                      <span className="text-sm text-white/50 font-sans">Signing you in…</span>
                    </div>
                  )}
                  {/* Kept mounted (never swapped for the spinner via a ternary)
                      so Google's script doesn't get re-initialized on every attempt. */}
                  <div
                    className={`flex justify-center [&>div]:!w-full [&_div[role=button]]:!w-full [&_div[role=button]]:!max-w-none ${
                      authLoading ? 'invisible pointer-events-none' : ''
                    }`}
                  >
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
                </div>

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
        onRequireAuth={isHydrated && !isAuthenticated ? handleRequireAuthForPayment : undefined}
        allowedDurations={offeredDurations}
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
