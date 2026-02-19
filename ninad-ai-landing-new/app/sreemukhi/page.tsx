"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type FlowState = "idle" | "auth" | "payment" | "active";

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

import { notFound } from "next/navigation";

export default function SreemukhiVoiceChatPage() {
    return notFound();
    const router = useRouter();

    const [flowState, setFlowState] = useState<FlowState>("idle");
    const [selectedMinutes, setSelectedMinutes] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const creatorName = "Sreemukhi";
    const creatorImage = "/assets/creators/sreemukhi face.jpg";
    const creatorRole = "Actor & Anchor";

    const TIME_OPTIONS_INR = [
        { minutes: 0.5, price: 49, label: "30 Seconds" },
        { minutes: 15, price: 299, label: "15 Minutes" },
        { minutes: 20, price: 399, label: "20 Minutes" },
        { minutes: 30, price: 599, label: "30 Minutes" },
        { minutes: 60, price: 999, label: "60 Minutes" },
    ];

    useEffect(() => {
        const t = setTimeout(() => setIsVisible(true), 100);

        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            clearTimeout(t);
            window.removeEventListener('mousemove', handleMouseMove);
        };
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

    // Simulate speech activity
    useEffect(() => {
        if (flowState !== "active") return;
        const interval = setInterval(() => {
            if (Math.random() > 0.6) setIsSpeaking(prev => !prev);
        }, 400);
        return () => clearInterval(interval);
    }, [flowState]);

    const handleStartTalking = () => setFlowState("auth");

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

    return (
        <main className="relative min-h-screen w-full overflow-hidden bg-[#0F0F13] text-white font-sans selection:bg-rose-500/30">

            {/* ===== FLUID BACKGROUND BLOB ===== */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-rose-500/20 blur-[100px] animate-blob mix-blend-screen"
                    style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
                />
                <div
                    className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-500/20 blur-[100px] animate-blob animation-delay-2000 mix-blend-screen"
                    style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%' }}
                />
                <div
                    className="absolute top-[30%] left-[40%] w-[50vw] h-[50vw] bg-purple-500/20 blur-[120px] animate-blob animation-delay-4000 mix-blend-screen"
                    style={{ borderRadius: '50% 50% 20% 80% / 25% 80% 20% 75%' }}
                />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />
            </div>

            {/* ===== CONTENT CONTAINER ===== */}
            <div
                className={`
                    relative z-10 w-full min-h-screen flex flex-col items-center justify-center p-6 
                    transition-all duration-1000 ease-out 
                    ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
                `}
            >
                {flowState === "active" ? (
                    /* === ACTIVE INTERFACE (Organic / Floating) === */
                    <div className="w-full h-full flex flex-col items-center justify-center">

                        {/* Fluid Avatar Container */}
                        <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] mb-12">
                            {/* Animated Border Blob */}
                            <div
                                className={`absolute inset-[-20px] bg-gradient-to-r from-rose-500 to-indigo-500 opacity-30 blur-xl transition-all duration-500 ${isSpeaking ? 'scale-110' : 'scale-100'}`}
                                style={{
                                    borderRadius: isSpeaking ? '60% 40% 30% 70% / 60% 30% 70% 40%' : '40% 60% 70% 30% / 50% 60% 30% 60%',
                                    animation: 'morph 8s ease-in-out infinite'
                                }}
                            />

                            {/* Avatar Mask */}
                            <div
                                className="relative w-full h-full overflow-hidden shadow-2xl transition-all duration-1000"
                                style={{
                                    borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%',
                                    animation: 'morph 12s ease-in-out infinite alternate',
                                    transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`
                                }}
                            >
                                <Image
                                    src={creatorImage}
                                    alt={creatorName}
                                    fill
                                    className="object-cover scale-110"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
                            </div>

                            {/* Status Indicator (Floating Orb) */}
                            <div className="absolute -bottom-4 -right-4 bg-black/40 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 shadow-lg">
                                <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-rose-400'}`} />
                                <span className="text-xs font-bold tracking-widest uppercase text-white/90">
                                    {isSpeaking ? "Speaking" : "Listening..."}
                                </span>
                            </div>
                        </div>

                        {/* Minimal Controls */}
                        <div className="flex items-center gap-8">
                            <div className="text-center">
                                <div className="text-xs text-white/50 uppercase tracking-widest mb-1">Time Left</div>
                                <div className="text-4xl font-light tabular-nums tracking-tighter">{formatTime(timeLeft)}</div>
                            </div>

                            <button
                                onClick={handleEndCall}
                                className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-rose-500/20 hover:border-rose-500/50 hover:text-rose-400 transition-all duration-300 group"
                            >
                                <div className="w-6 h-6 border-b-2 border-l-2 border-current rotate-[-45deg] translate-x-1 group-hover:translate-x-0 transition-transform" />
                            </button>
                        </div>

                    </div>
                ) : (
                    /* === IDLE STATE (Asymmetric / Editorial) === */
                    <div className="relative w-full max-w-6xl mx-auto h-[80vh] flex flex-col md:flex-row items-center justify-between">

                        {/* Left: Text Content */}
                        <div className="relative z-20 flex flex-col items-center md:items-start text-center md:text-left mb-12 md:mb-0">
                            <h2 className="text-sm md:text-base text-rose-300 font-bold tracking-[0.2em] uppercase mb-4 animate-fade-in-up">
                                • {creatorRole}
                            </h2>
                            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 mix-blend-exclusion">
                                <span className="block">Sree</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">mukhi.</span>
                            </h1>

                            <button
                                onClick={handleStartTalking}
                                className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg tracking-wide shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-500 hover:scale-105"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    Start Session <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </span>
                            </button>
                        </div>

                        {/* Right: Organic Image Composition */}
                        <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[600px] flex-shrink-0">

                            {/* Main Blob Image */}
                            <div
                                className="relative w-full h-full overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-700"
                                style={{
                                    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                                    transform: `translate(${mousePos.x * -1}px, ${mousePos.y * -1}px)`
                                }}
                            >
                                <Image
                                    src={creatorImage}
                                    alt={creatorName}
                                    fill
                                    className="object-cover scale-110"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                            </div>

                            {/* Floating Decorative Elements */}
                            <div
                                className="absolute -top-12 -right-12 w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 z-20 animate-float"
                                style={{ borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%' }}
                            />
                            <div
                                className="absolute bottom-20 -left-16 w-32 h-32 bg-rose-500/20 backdrop-blur-md border border-rose-500/20 z-20 animate-float animation-delay-2000"
                                style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
                            />

                        </div>

                    </div>
                )}
            </div>

            {/* ===== ORGANIC MODAL ===== */}
            {(flowState === "auth" || flowState === "payment") && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-all duration-500"
                        onClick={() => setFlowState("idle")}
                    />

                    <div className="relative w-full max-w-md animate-fade-in-up">
                        <div
                            className="relative bg-black/80 backdrop-blur-3xl border border-white/10 p-8 md:p-12 shadow-2xl overflow-hidden"
                            style={{ borderRadius: '2rem' }}
                        >
                            {/* Modal Fluid Background */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 blur-[80px] rounded-full pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />

                            <div className="relative z-10">
                                <h3 className="text-3xl font-black mb-2 text-white">
                                    {flowState === "auth" ? "Identification." : "Duration."}
                                </h3>
                                <p className="text-white/50 mb-8">
                                    {flowState === "auth" ? "Choose how you would like to proceed." : "Select your preferred session length."}
                                </p>

                                {flowState === "auth" && (
                                    <button
                                        onClick={() => setFlowState("payment")}
                                        className="w-full py-5 bg-white hover:bg-white/90 text-black font-bold text-lg rounded-2xl transition-all hover:scale-[1.02] shadow-xl"
                                    >
                                        Continue as Guest
                                    </button>
                                )}

                                {flowState === "payment" && (
                                    <div className="space-y-3">
                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {TIME_OPTIONS_INR.map((opt) => {
                                                const isSelected = selectedMinutes === opt.minutes;
                                                return (
                                                    <button
                                                        key={opt.minutes}
                                                        onClick={() => handleSelectTime(opt.minutes)}
                                                        className={`
                                                            flex-1 min-w-[100px] py-3 px-4 rounded-xl border-2 transition-all duration-300
                                                            ${isSelected
                                                                ? "bg-white text-black border-white"
                                                                : "bg-transparent text-white/60 border-white/10 hover:border-white/40"
                                                            }
                                                        `}
                                                    >
                                                        <div className="text-xs font-bold uppercase tracking-wider mb-1">{opt.minutes < 1 ? '30 sec' : `${opt.minutes} min`}</div>
                                                        <div className="font-bold">₹{opt.price}</div>
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        <button
                                            onClick={handlePayAndStart}
                                            disabled={!selectedMinutes}
                                            className={`
                                                w-full py-5 rounded-2xl font-bold text-lg transition-all duration-500
                                                ${selectedMinutes
                                                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-lg hover:shadow-orange-500/40 hover:scale-[1.01]"
                                                    : "bg-white/5 text-white/20 cursor-not-allowed"
                                                }
                                            `}
                                        >
                                            Begin Session
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
                @keyframes morph {
                    0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                }
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </main>
    );
}
