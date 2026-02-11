"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

type FlowState = "idle" | "auth" | "payment" | "active";

const TIME_OPTIONS = [
    { minutes: 10, price: 2.99 },
    { minutes: 15, price: 3.99 },
    { minutes: 20, price: 4.99 },
    { minutes: 30, price: 6.99 },
    { minutes: 60, price: 11.99 },
];

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function CreatorVoiceChatPage() {
    const router = useRouter();

    const [flowState, setFlowState] = useState<FlowState>("idle");
    const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const creatorName = "Creator Name";
    const creatorRole = "Voice Creator";

    useEffect(() => {
        const t = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (flowState !== "active" || timeLeft <= 0) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current!);
                    setFlowState("idle");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [flowState, timeLeft]);

    useEffect(() => {
        if (flowState !== "active") return;
        const interval = setInterval(() => {
            setIsSpeaking((p) => !p);
        }, 2000 + Math.random() * 2000);
        return () => clearInterval(interval);
    }, [flowState]);

    const handleStartTalking = () => setFlowState("auth");

    const handleGoogleAuth = () => {
        setTimeout(() => setFlowState("payment"), 800);
    };

    const handleSelectTime = (minutes: number) => {
        setSelectedMinutes(minutes);
    };

    const handlePayAndStart = () => {
        if (!selectedMinutes) return;
        setTimeLeft(selectedMinutes * 60);
        setFlowState("active");
    };

    const handleEndCall = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        setFlowState("idle");
        setTimeLeft(0);
        setSelectedMinutes(null);
    }, []);

    const progressPercent =
        selectedMinutes && timeLeft > 0
            ? (timeLeft / (selectedMinutes * 60)) * 100
            : 0;

    return (
        <main className="relative min-h-screen overflow-hidden bg-black selection:bg-primary/30">
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div
                    className="absolute h-[700px] w-[700px] left-[-200px] top-[-100px] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(97,37,216,0.6)_0%,transparent_70%)] animate-pulse"
                    style={{ animationDuration: "8s" }}
                />
                <div
                    className="absolute h-[500px] w-[500px] right-[-150px] top-[200px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(59,130,246,0.45)_0%,transparent_70%)] animate-pulse"
                    style={{ animationDuration: "10s", animationDelay: "2s" }}
                />
                <div className="absolute h-[600px] w-[800px] left-[30%] bottom-[-200px] rounded-full blur-[160px] bg-[radial-gradient(circle,rgba(147,51,234,0.4)_0%,transparent_70%)]" />
            </div>

            <div
                className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-28 pb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                    }`}
            >
                <button
                    onClick={() => router.push("/creators")}
                    className="absolute top-28 left-6 md:left-12 flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-medium"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                    Back to Creators
                </button>

                {flowState === "active" ? (
                    <div className="flex flex-col items-center gap-8 w-full max-w-lg">
                        <div className="relative w-48 h-48 md:w-64 md:h-64">
                            <div
                                className={`absolute inset-0 rounded-full transition-all duration-700 ${isSpeaking
                                        ? "bg-primary/50 blur-[80px] scale-125"
                                        : "bg-primary/25 blur-[50px] scale-100"
                                    }`}
                            />
                            <div
                                className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ${isSpeaking
                                        ? "border-primary/60 scale-110"
                                        : "border-primary/20 scale-100"
                                    }`}
                            />
                            <div
                                className={`absolute inset-2 rounded-full border transition-all duration-700 ${isSpeaking
                                        ? "border-accent-blue/40 scale-105"
                                        : "border-accent-blue/15 scale-100"
                                    }`}
                            />
                            <img
                                src="/assets/hero-orb.png"
                                alt="Voice Orb"
                                className={`absolute inset-0 w-full h-full object-contain z-10 transition-all duration-700 ${isSpeaking ? "scale-110 brightness-150" : "scale-100"
                                    }`}
                            />

                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-end gap-1 h-8">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1 rounded-full bg-gradient-to-t from-primary to-accent-blue transition-all duration-300"
                                        style={{
                                            height: isSpeaking
                                                ? `${8 + Math.sin(Date.now() / 200 + i * 0.8) * 16 + Math.random() * 8}px`
                                                : "4px",
                                            opacity: isSpeaking ? 0.8 : 0.3,
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="text-center mt-4">
                            <h2 className="text-2xl md:text-3xl font-bold text-white">
                                {creatorName}
                            </h2>
                            <p className="text-white/50 text-sm mt-1">
                                {isSpeaking ? "Speaking..." : "Listening..."}
                            </p>
                        </div>

                        <div className="w-full max-w-xs">
                            <div className="flex justify-between text-xs text-white/40 mb-2">
                                <span>Time Remaining</span>
                                <span className="font-mono text-white/70 text-sm">
                                    {formatTime(timeLeft)}
                                </span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-primary to-accent-blue rounded-full transition-all duration-1000 ease-linear"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleEndCall}
                            className="mt-4 group relative flex items-center gap-3 px-8 py-4 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-bold hover:bg-red-500/30 hover:border-red-500/60 hover:text-red-300 transition-all duration-300"
                        >
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.128a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.279 3H5z"
                                />
                            </svg>
                            End Call
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
                        <div className="relative w-40 h-40 md:w-52 md:h-52 group cursor-default">
                            <div className="absolute inset-0 bg-primary/30 blur-[60px] rounded-full scale-75 animate-pulse transition-all duration-700 group-hover:bg-primary/60 group-hover:blur-[100px] group-hover:scale-100" />
                            <img
                                src="/assets/hero-orb.png"
                                alt="Voice Orb"
                                className="absolute inset-0 w-full h-full object-contain scale-125 z-10 transition-all duration-700 group-hover:brightness-150"
                            />
                        </div>

                        <div className="text-center">
                            <h1
                                className="
                  font-sans font-black text-4xl md:text-5xl lg:text-6xl
                  leading-none tracking-tight bg-clip-text text-transparent
                  bg-gradient-to-b from-white to-white/50 pb-2
                "
                            >
                                {creatorName}
                            </h1>
                            <p className="text-white/50 text-lg mt-2 font-medium">
                                {creatorRole}
                            </p>
                        </div>

                        <p className="text-center text-white/40 max-w-md text-sm leading-relaxed">
                            Experience a voice conversation powered by AI. Talk naturally and
                            hear responses in this creator&apos;s unique voice style.
                        </p>

                        <button
                            onClick={handleStartTalking}
                            className="
                relative overflow-hidden
                px-10 py-4 rounded-full
                bg-gradient-to-r from-primary to-[#8b5cf6]
                text-white font-bold text-lg
                shadow-[0_0_40px_rgba(97,37,216,0.4)]
                hover:shadow-[0_0_60px_rgba(97,37,216,0.6)]
                hover:scale-105
                active:scale-95
                transition-all duration-300
                group
              "
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <svg
                                    className="w-6 h-6 group-hover:animate-pulse"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                    />
                                </svg>
                                Start Talking!
                            </span>
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                        </button>
                    </div>
                )}
            </div>

            {flowState === "auth" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setFlowState("idle")}
                    />
                    <div className="relative w-full max-w-md bg-[#1a1a2e] border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in-up">
                        <div className="p-8 pb-4 text-center">
                            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary/30 to-accent-blue/20 border border-white/10 flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Sign in to continue
                            </h3>
                            <p className="text-white/40 text-sm">
                                Connect your Google account to start talking
                            </p>
                        </div>

                        <div className="px-8 pb-8">
                            <button
                                onClick={handleGoogleAuth}
                                className="
                  w-full flex items-center justify-center gap-3
                  px-6 py-4 rounded-2xl
                  bg-white text-gray-800 font-semibold text-base
                  hover:bg-gray-100 active:scale-[0.98]
                  transition-all duration-200
                  shadow-[0_4px_20px_rgba(0,0,0,0.3)]
                "
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Continue with Google
                            </button>

                            <div className="mt-6 flex items-center gap-3">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-white/30 text-xs">or</span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>

                            <button
                                onClick={() => setFlowState("payment")}
                                className="
                  w-full mt-4 flex items-center justify-center gap-2
                  px-6 py-3.5 rounded-2xl
                  bg-white/5 border border-white/10
                  text-white/70 font-medium text-sm
                  hover:bg-white/10 hover:text-white hover:border-white/20
                  transition-all duration-200
                "
                            >
                                Continue as Guest
                            </button>

                            <p className="text-center text-white/25 text-xs mt-6 leading-relaxed">
                                By continuing, you agree to our Terms of Service and Privacy
                                Policy.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {flowState === "payment" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setFlowState("idle")}
                    />
                    <div className="relative w-full max-w-lg bg-[#1a1a2e] border border-white/10 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in-up">
                        <div className="p-8 pb-4 text-center">
                            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-primary/30 to-accent-blue/20 border border-white/10 flex items-center justify-center">
                                <svg
                                    className="w-8 h-8 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                Choose Your Session
                            </h3>
                            <p className="text-white/40 text-sm">
                                Select how long you&apos;d like to talk with {creatorName}
                            </p>
                        </div>

                        <div className="px-8 pb-4 space-y-3">
                            {TIME_OPTIONS.map((opt) => (
                                <button
                                    key={opt.minutes}
                                    onClick={() => handleSelectTime(opt.minutes)}
                                    className={`
                    w-full flex items-center justify-between
                    px-5 py-4 rounded-2xl
                    border transition-all duration-200
                    ${selectedMinutes === opt.minutes
                                            ? "bg-primary/20 border-primary/60 shadow-[0_0_20px_rgba(97,37,216,0.2)]"
                                            : "bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20"
                                        }
                  `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${selectedMinutes === opt.minutes
                                                    ? "border-primary bg-primary"
                                                    : "border-white/30"
                                                }`}
                                        >
                                            {selectedMinutes === opt.minutes && (
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <span className="text-white font-semibold">
                                            {opt.minutes} minutes
                                        </span>
                                    </div>
                                    <span
                                        className={`font-bold text-lg ${selectedMinutes === opt.minutes
                                                ? "text-primary-light"
                                                : "text-white/60"
                                            }`}
                                    >
                                        ${opt.price.toFixed(2)}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="px-8 pb-8 pt-4">
                            <button
                                onClick={handlePayAndStart}
                                disabled={!selectedMinutes}
                                className={`
                  w-full flex items-center justify-center gap-2
                  px-6 py-4 rounded-2xl
                  font-bold text-base
                  transition-all duration-300
                  ${selectedMinutes
                                        ? "bg-gradient-to-r from-primary to-[#8b5cf6] text-white shadow-[0_0_30px_rgba(97,37,216,0.4)] hover:shadow-[0_0_50px_rgba(97,37,216,0.6)] hover:scale-[1.02] active:scale-[0.98]"
                                        : "bg-white/5 text-white/30 cursor-not-allowed"
                                    }
                `}
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                    />
                                </svg>
                                {selectedMinutes
                                    ? `Pay $${TIME_OPTIONS.find((o) => o.minutes === selectedMinutes)?.price.toFixed(2)} & Start`
                                    : "Select a duration"}
                            </button>

                            <p className="text-center text-white/25 text-xs mt-4">
                                This is a mock payment. No real charges will be made.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
