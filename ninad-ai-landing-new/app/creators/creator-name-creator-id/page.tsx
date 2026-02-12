"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type FlowState = "idle" | "auth" | "payment" | "active";

const TIME_OPTIONS = [
    { minutes: 0.5, price: 2.99, label: "30 Seconds" },
    { minutes: 15, price: 3.99, label: "15 Minutes" },
    { minutes: 20, price: 4.99, label: "20 Minutes" },
    { minutes: 30, price: 6.99, label: "30 Minutes" },
    { minutes: 60, price: 11.99, label: "60 Minutes" },
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
    const [waveformHeights, setWaveformHeights] = useState<number[]>(
        Array.from({ length: 16 }, (_, i) => 4 + (i % 3) * 2)
    );
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const creatorName = "Scarlett Johansson";
    const creatorImage = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop";
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
            setWaveformHeights(
                Array.from({ length: 16 }, () => 10 + Math.random() * 40)
            );
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
        <main className="relative min-h-screen overflow-hidden bg-black selection:bg-primary/30 font-sans">
            {/* Background - Enhanced Gradients */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div
                    className="absolute h-[800px] w-[800px] left-[-200px] top-[-100px] rounded-full blur-[150px] bg-[radial-gradient(circle,rgba(97,37,216,0.35)_0%,transparent_70%)] animate-pulse"
                    style={{ animationDuration: "8s" }}
                />
                <div
                    className="absolute h-[600px] w-[600px] right-[-150px] top-[100px] rounded-full blur-[130px] bg-[radial-gradient(circle,rgba(59,130,246,0.3)_0%,transparent_70%)] animate-pulse"
                    style={{ animationDuration: "10s", animationDelay: "2s" }}
                />
                <div className="absolute h-[700px] w-[900px] left-[20%] bottom-[-200px] rounded-full blur-[160px] bg-[radial-gradient(circle,rgba(147,51,234,0.25)_0%,transparent_70%)]" />
            </div>

            <div
                className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-32 pb-12 transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >


                {flowState === "active" ? (
                    /* ===== ACTIVE VOICE CHAT UI ===== */
                    <div className="flex flex-col items-center gap-10 w-full max-w-lg animate-fade-in-up">
                        {/* Animated Orb - Active */}
                        <div className="relative w-[280px] h-[280px]">
                            {/* Core Glow */}
                            <div
                                className={`absolute inset-0 rounded-full transition-all duration-500 ease-in-out ${isSpeaking
                                    ? "bg-primary/40 blur-[90px] scale-110"
                                    : "bg-primary/20 blur-[60px] scale-100"
                                    }`}
                            />

                            {/* Outer Ring */}
                            <div
                                className={`absolute inset-0 rounded-full border border-white/10 transition-all duration-700 ${isSpeaking ? "scale-105 opacity-50" : "scale-100 opacity-20"
                                    }`}
                            />

                            {/* Inner Ring */}
                            <div
                                className={`absolute inset-4 rounded-full border border-white/20 transition-all duration-500 ${isSpeaking ? "scale-100 opacity-80" : "scale-95 opacity-30"
                                    }`}
                            />

                            {/* Main Orb Image */}
                            <div className="absolute inset-0 rounded-full overflow-hidden z-10">
                                <Image
                                    src={creatorImage}
                                    alt={creatorName}
                                    fill
                                    className={`object-cover transition-all duration-300 ${isSpeaking ? "scale-110 brightness-110" : "scale-100 brightness-100"
                                        }`}
                                />
                            </div>

                            {/* Dynamic Waveform */}
                            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center justify-center gap-1.5 h-12 w-full">
                                {Array.from({ length: 16 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1.5 rounded-full bg-gradient-to-t from-primary via-accent-blue to-white transition-all duration-200"
                                        style={{
                                            height: isSpeaking
                                                ? `${waveformHeights[i]}px`
                                                : `${4 + (i % 3) * 2}px`,
                                            opacity: isSpeaking ? 0.9 : 0.3,
                                            animationDelay: `${i * 0.05}s`
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Status & Timer */}
                        <div className="text-center mt-8 space-y-6 w-full">
                            <div>
                                <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                                    {creatorName}
                                </h2>
                                <div className="flex items-center justify-center gap-2">
                                    <span className={`flex w-2 h-2 rounded-full ${isSpeaking ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
                                    <p className="text-white/60 text-sm font-medium tracking-wide uppercase">
                                        {isSpeaking ? "Speaking" : "Listening"}
                                    </p>
                                </div>
                            </div>

                            {/* Timer Progress */}
                            <div className="w-full max-w-xs mx-auto bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-sm">
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-xs text-white/40 font-medium uppercase tracking-wider">Time Remaining</span>
                                    <span className="font-mono text-2xl font-bold text-white tabular-nums tracking-tight">
                                        {formatTime(timeLeft)}
                                    </span>
                                </div>
                                <div className="relative w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-purple-500 to-accent-blue rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(168,85,247,0.5)]"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* End Call Button */}
                        <button
                            onClick={handleEndCall}
                            className="
                group relative flex items-center gap-3 
                px-8 py-4 rounded-full 
                bg-red-500/10 border border-red-500/30 
                text-red-400 font-bold tracking-wide
                hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]
                active:scale-95
                transition-all duration-300
              "
                        >
                            <div className="p-1.5 rounded-full bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.36 7.46 6 12 6s8.66 2.36 11.71 5.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
                                </svg>
                            </div>
                            End Session
                        </button>
                    </div>
                ) : (
                    /* ===== IDLE STATE ===== */
                    <div className="flex flex-col items-center gap-10 w-full max-w-3xl">
                        {/* Orb Container */}
                        <div className="relative w-48 h-48 md:w-64 md:h-64 group cursor-pointer transition-transform duration-500 hover:scale-105">
                            <div className="absolute inset-0 bg-primary/20 blur-[70px] rounded-full scale-90 animate-pulse transition-all duration-700 group-hover:bg-primary/50 group-hover:blur-[100px] group-hover:scale-110" />
                            <div className="absolute inset-0 rounded-full border border-white/5 group-hover:border-white/20 transition-colors duration-500 z-20" />
                            <div className="absolute inset-0 rounded-full overflow-hidden z-10">
                                <Image
                                    src={creatorImage}
                                    alt={creatorName}
                                    fill
                                    className="object-cover transition-all duration-700 group-hover:scale-110"
                                />
                            </div>
                        </div>

                        {/* Typography */}
                        <div className="text-center space-y-4">
                            <h1 className="relative inline-block">
                                <span className="
                  font-sans font-black text-5xl md:text-7xl lg:text-8xl
                  tracking-tighter text-transparent bg-clip-text
                  bg-gradient-to-b from-white via-white/90 to-white/40
                ">
                                    {creatorName.toUpperCase()}
                                </span>
                                <div className="absolute -inset-x-8 -inset-y-4 bg-white/5 blur-3xl -z-10 rounded-full opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity bg-gradient-to-r from-primary/20 via-transparent to-accent-blue/20" />
                            </h1>

                            <div className="flex items-center justify-center gap-3">
                                <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/30" />
                                <p className="text-white/70 text-lg md:text-xl font-medium tracking-wide">
                                    {creatorRole}
                                </p>
                                <div className="h-px w-8 bg-gradient-to-l from-transparent to-white/30" />
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-center text-white/50 max-w-lg text-base leading-relaxed font-light">
                            Experience a voice conversation powered by <span className="text-white font-medium">Ninad AI</span>.
                            Talk naturally and hear responses in this creator&apos;s unique voice style.
                        </p>

                        {/* Start Button - Enhanced */}
                        <button
                            onClick={handleStartTalking}
                            className="
                relative group overflow-hidden
                px-12 py-5 rounded-full
                bg-white text-black
                font-bold text-lg tracking-wide
                shadow-[0_0_40px_rgba(255,255,255,0.2)]
                hover:shadow-[0_0_80px_rgba(255,255,255,0.4)]
                hover:scale-105 active:scale-95
                transition-all duration-300
              "
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 rotate-12" />
                            <span className="relative z-10 flex items-center gap-3">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform">
                                    <path d="M12 18.5C15.5898 18.5 18.5 15.5899 18.5 12C18.5 8.41015 15.5898 5.5 12 5.5C8.41015 5.5 5.5 8.41015 5.5 12C5.5 15.5899 8.41015 18.5 12 18.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M19.14 19.14L19.01 19.01M19.01 4.99L19.14 4.86L19.01 4.99ZM4.86 19.14L4.99 19.01L4.86 19.14ZM4.99 4.99L4.86 4.86L4.99 4.99Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span>Start Talking</span>
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* ===== GOOGLE OAUTH MODAL - Enhanced ===== */}
            {flowState === "auth" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
                        onClick={() => setFlowState("idle")}
                    />
                    <div className="relative w-full max-w-sm bg-[#0a0a0f] border border-white/10 rounded-[32px] shadow-[0_0_100px_rgba(97,37,216,0.15)] overflow-hidden animate-fade-in-up">

                        {/* Modal Glow */}
                        <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative z-10 p-8 pb-10 text-center">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Authentication</h3>
                            <p className="text-white/40 text-sm mb-8 px-4 leading-relaxed">
                                Seamlessly connect to start your voice session with {creatorName}
                            </p>

                            <button
                                onClick={handleGoogleAuth}
                                className="
                  w-full flex items-center justify-center gap-3
                  px-6 py-4 rounded-xl
                  bg-white text-black font-bold text-base
                  hover:bg-gray-200 active:scale-[0.98]
                  transition-all duration-200
                  shadow-lg
                "
                            >
                                <div className="w-5 h-5 relative">
                                    <svg viewBox="0 0 24 24" className="w-full h-full">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                </div>
                                Continue with Google
                            </button>

                            <button
                                onClick={() => setFlowState("payment")}
                                className="
                  w-full mt-3 flex items-center justify-center gap-2
                  px-6 py-4 rounded-xl
                  bg-white/5 border border-white/10
                  text-white/70 font-semibold text-sm
                  hover:bg-white/10 hover:text-white hover:border-white/20
                  active:scale-[0.98]
                  transition-all duration-200
                "
                            >
                                Continue as Guest
                            </button>

                            <p className="text-[10px] text-white/20 mt-6 max-w-[200px] mx-auto">
                                Protected by reCAPTCHA and subject to the Privacy Policy and Terms of Service.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== TIME / PAYMENT MODAL - Enhanced ===== */}
            {flowState === "payment" && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={() => setFlowState("idle")}
                    />
                    <div className="relative w-full max-w-lg bg-[#0a0a0f] border border-white/10 rounded-[32px] shadow-[0_0_120px_rgba(97,37,216,0.1)] overflow-hidden animate-fade-in-up">
                        {/* Modal Glow */}
                        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-blue/10 blur-[80px] rounded-full pointer-events-none" />

                        <div className="relative z-10 px-6 pt-8 pb-4">
                            <h3 className="text-2xl font-bold text-white mb-2 ml-2">Choose Session Length</h3>
                            <p className="text-white/40 text-sm ml-2 mb-6">Rates for {creatorName}</p>

                            <div className="space-y-3">
                                {TIME_OPTIONS.map((opt) => {
                                    const isSelected = selectedMinutes === opt.minutes;
                                    return (
                                        <button
                                            key={opt.minutes}
                                            onClick={() => handleSelectTime(opt.minutes)}
                                            className={`
                      group w-full flex items-center justify-between
                      px-5 py-4 rounded-2xl
                      border transition-all duration-300
                      ${isSelected
                                                    ? "bg-primary/10 border-primary/50 shadow-[0_0_30px_rgba(97,37,216,0.15)]"
                                                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                                                }
                    `}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`
                          w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300
                          ${isSelected ? "border-primary bg-primary" : "border-white/20 group-hover:border-white/40"}
                        `}
                                                >
                                                    {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                                                </div>
                                                <div className="text-left">
                                                    <span className={`block font-semibold text-base transition-colors ${isSelected ? 'text-white' : 'text-white/80'}`}>
                                                        {opt.label}
                                                    </span>
                                                </div>
                                            </div>
                                            <span
                                                className={`font-bold text-lg tracking-tight transition-colors ${isSelected ? "text-primary-light" : "text-white/50 group-hover:text-white/80"
                                                    }`}
                                            >
                                                ${opt.price.toFixed(2)}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6 pt-2 bg-[#0a0a0f]/50 border-t border-white/5 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <span className="text-white/40 text-sm">Total</span>
                                <span className="text-2xl font-bold text-white">
                                    {selectedMinutes
                                        ? `$${TIME_OPTIONS.find((o) => o.minutes === selectedMinutes)?.price.toFixed(2)}`
                                        : "$0.00"}
                                </span>
                            </div>
                            <button
                                onClick={handlePayAndStart}
                                disabled={!selectedMinutes}
                                className={`
                  w-full flex items-center justify-center gap-2
                  px-6 py-4 rounded-xl
                  font-bold text-base tracking-wide
                  transition-all duration-300
                  ${selectedMinutes
                                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-[1.01]"
                                        : "bg-white/10 text-white/20 cursor-not-allowed"
                                    }
                `}
                            >
                                {selectedMinutes ? "Proceed to Payment" : "Select a duration"}
                                <svg className={`w-4 h-4 ${selectedMinutes ? 'translate-x-0' : '-translate-x-1 opacity-0'} transition-all`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
