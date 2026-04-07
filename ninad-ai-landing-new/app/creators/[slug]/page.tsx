"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "../../lib/stores";
import { startStreamingMic, type StreamingMicHandle } from "../../lib/audioUtils";
import CreatorVoiceSessionUI from "../../components/CreatorVoiceSessionUI";
import TermsAgreement from "../../components/auth/TermsAgreement";
import PaymentModal from "../../components/payment/PaymentModal";
import Aurora from "../../components/ui/Aurora";
import { toast } from "sonner";
import { authApi } from "../../lib/api";
import { buildVoiceWsUrl } from "../../lib/config";
import { openAppWebSocket } from "../../lib/websocket";
import type { AllowedDurationMinutes } from "../../lib/types";

/* ── Flow: idle → auth (if needed) → duration → active ── */
type FlowState = "idle" | "auth" | "duration" | "active";
type CallPhase = "connecting" | "listening" | "speaking";
type AuthTab = "login" | "signup";

// Defaults for quick testing
const DEFAULT_INFLUENCER_ID = "influencer_8";
const DEFAULT_PREFERRED_PROVIDER = "deepgram";

function getAuthErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as { response?: { data?: { detail?: string; message?: string } } };
  return apiError.response?.data?.detail || apiError.response?.data?.message || fallback;
}

/* ── Creator data ── */
const CREATORS_DATA: Record<string, { name: string; image: string; role: string; influencerId: string; preferredProvider: string }> = {
  "pawan-kumar": {
    name: "Pawan Kumar",
    image: "/assets/creators/pavan.png",
    role: "Influencer & Actor",
    influencerId: DEFAULT_INFLUENCER_ID,
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
  const creatorInfluencerId = creatorData?.influencerId ?? DEFAULT_INFLUENCER_ID;
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
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authAcceptedTerms, setAuthAcceptedTerms] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

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

  /* ═══════════════════════════════════════
     WebSocket streaming (when active)
     ═══════════════════════════════════════ */

  useEffect(() => {
    if (flowState !== "active") return;
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
        processBinaryChunk(event.data);
      } else {
        try {
          const msg = JSON.parse(event.data as string);
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
        } catch {
          // non-JSON
        }
      }
    };

    ws.onerror = () => {
      if (!disposed) setCallPhase("connecting");
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
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
      wsRef.current = null;
      ttsActiveRef.current = false;
      stopPlayback();
    };
  }, [creatorInfluencerId, flowState, preferredProvider, processBinaryChunk, slug, stopPlayback]);

  const handleEndCall = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    micControllerRef.current?.stop();
    micControllerRef.current = null;
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      wsRef.current.close();
    }
    wsRef.current = null;
    stopPlayback();
    ttsActiveRef.current = false;
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

  const handleStartSession = () => {
    if (isHydrated && isAuthenticated) {
      setFlowState("duration");
    } else {
      setFlowState("auth");
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authTab === "login" && (!authEmail || !authPassword)) {
      toast.error("Please fill in all fields");
      return;
    }
    if (authTab === "signup" && (!authEmail || !authPassword || !authName)) {
      toast.error("Please fill in all fields");
      return;
    }
    if (authTab === "signup" && !authAcceptedTerms) {
      toast.error("Please review and accept the Terms & Conditions to continue.");
      return;
    }

    setAuthLoading(true);

    try {
      if (authTab === "login") {
        const response = await authApi.login({
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
        });
        authLogin(response.user, response.tokens.access_token);
        toast.success(`Welcome back, ${response.user.name}!`);
      } else {
        const response = await authApi.register({
          name: authName.trim(),
          email: authEmail.trim().toLowerCase(),
          password: authPassword,
          role: "user",
        });
        authLogin(response.user, response.tokens.access_token);
        toast.success(`Welcome, ${response.user.name}!`);
      }

      setFlowState("duration");
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
      setAuthAcceptedTerms(false);
    } catch (error) {
      const fallback = authTab === "login" ? "Login failed. Please try again." : "Could not create account.";
      toast.error(getAuthErrorMessage(error, fallback));
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePaymentVerified = (durationMinutes: AllowedDurationMinutes, bookingId?: string) => {
    const query = new URLSearchParams({ duration: String(durationMinutes) });
    if (bookingId) {
      query.set("booking_id", bookingId);
    }

    router.push(`/creators/${slug}/voice-chat?${query.toString()}`);
  };

  const closeModal = () => {
    setFlowState("idle");
    setSelectedMinutes(null);
    setAuthEmail("");
    setAuthPassword("");
    setAuthName("");
    setAuthAcceptedTerms(false);
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
            onEndCall={handleEndCall}
            creatorName={creatorName}
            creatorImage={creatorImage}
          />
        ) : (
          <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-6 sm:gap-8 md:flex-row md:justify-between md:gap-12 lg:gap-16">
            <div className="relative z-20 flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-[10px] sm:text-sm md:text-base text-rose-300 font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase mb-2 sm:mb-4 animate-fade-in-up">
                • {creatorRole}
              </h2>
              <br />
              <h1 className="mt-2 text-[2.4rem] sm:text-5xl md:text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] mix-blend-exclusion">
                <span className="block">{creatorName.split(" ")[0]}</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
                  {creatorName.split(" ").slice(1).join(" ")}.
                </span>
              </h1>
              <br /><br />

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

            <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px] md:w-[380px] md:h-[460px] lg:w-[500px] lg:h-[600px] flex-shrink-0">
              <div
                ref={(el) => { avatarRefs.current[1] = el; }}
                className="relative w-full h-full overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-700 will-change-transform"
                style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
              >
                <Image src={creatorImage} alt={creatorName} fill className="object-cover scale-110" priority />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
              </div>
              <div className="absolute -top-6 -right-6 sm:-top-12 sm:-right-12 w-12 h-12 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md border border-white/20 z-20 animate-float" style={{ borderRadius: "50%" }} />
              <div className="absolute bottom-16 -left-4 sm:-left-16 w-14 h-14 sm:w-32 sm:h-32 bg-rose-500/20 backdrop-blur-md border border-rose-500/20 z-20 animate-float animation-delay-2000" style={{ borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%" }} />
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
                <div className="flex items-center justify-center gap-1 mb-8 p-1 rounded-full bg-white/5 border border-white/10">
                  <button onClick={() => setAuthTab("login")} className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${authTab === "login" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>
                    Login
                  </button>
                  <button onClick={() => setAuthTab("signup")} className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${authTab === "signup" ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {authTab === "signup" && (
                    <div>
                      <label className="block text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Name</label>
                      <input type="text" value={authName} onChange={(e) => setAuthName(e.target.value)} placeholder="Your name" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-white/30 transition-colors" required />
                    </div>
                  )}
                  <div>
                    <label className="block text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Email</label>
                    <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-white/30 transition-colors" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-white/40 uppercase tracking-wider mb-1.5">Password</label>
                    <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-white/30 transition-colors" required />
                  </div>

                  {authTab === "signup" && (
                    <TermsAgreement checked={authAcceptedTerms} onCheckedChange={setAuthAcceptedTerms} />
                  )}

                  <button type="submit" disabled={authLoading || (authTab === "signup" && !authAcceptedTerms)} className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm transition-all duration-300 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                    {authLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        {authTab === "login" ? "Signing in..." : "Creating account..."}
                      </span>
                    ) : (
                      authTab === "login" ? "Sign In" : "Create Account"
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-white/30 mt-5">
                  {authTab === "login" ? "Don't have an account? " : "Already have an account? "}
                  <button onClick={() => setAuthTab(authTab === "login" ? "signup" : "login")} className="text-white/60 font-semibold hover:text-white transition-colors">
                    {authTab === "login" ? "Sign Up" : "Login"}
                  </button>
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
      />
    </main>
  );
}
