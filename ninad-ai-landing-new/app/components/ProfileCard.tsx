"use client";

import React, { useEffect, useRef, useCallback, useMemo } from 'react';

const ANIMATION_CONFIG = {
    INITIAL_DURATION: 1200,
    INITIAL_X_OFFSET: 70,
    INITIAL_Y_OFFSET: 60,
    DEVICE_BETA_OFFSET: 20,
    ENTER_TRANSITION_MS: 180
} as const;

const clamp = (v: number, min = 0, max = 100): number => Math.min(Math.max(v, min), max);
const round = (v: number, precision = 3): number => parseFloat(v.toFixed(precision));

// ... imports

interface ProfileCardProps {
    avatarUrl?: string;
    className?: string;
    enableTilt?: boolean;
    enableMobileTilt?: boolean;
    mobileTiltSensitivity?: number;
    name?: string;
    title?: string;
    onContactClick?: () => void;
    contactText?: string;
    followers?: number;
    following?: number;
    // Deprecated/Unused props kept for compatibility
    behindGlowEnabled?: boolean;
    behindGlowColor?: string;
    behindGlowSize?: string;
    iconUrl?: string;
    grainUrl?: string;
    innerGradient?: string;
    miniAvatarUrl?: string;
    handle?: string;
    status?: string;
    showUserInfo?: boolean;
}

interface TiltEngine {
    setImmediate(x: number, y: number): void;
    setTarget(x: number, y: number): void;
    toCenter(): void;
    beginInitial(durationMs: number): void;
    getCurrent(): { x: number; y: number; tx: number; ty: number };
    cancel(): void;
}

const ProfileCardComponent: React.FC<ProfileCardProps> = ({
    avatarUrl,
    className = '',
    enableTilt = true,
    enableMobileTilt = false,
    mobileTiltSensitivity = 5,
    name = 'Anna Lorenza',
    title = 'Through the lens, I create stories worth remembering.',
    contactText = 'Follow +',
    followers = 114,
    following = 92,
    onContactClick,
    behindGlowEnabled = true,
    behindGlowColor = 'rgba(97, 37, 216, 0.4)',
    behindGlowSize = '60%',
}) => {
    // ... refs (wrapRef, shellRef, etc.)
    const wrapRef = useRef<HTMLDivElement>(null);
    const shellRef = useRef<HTMLDivElement>(null);
    const enterTimerRef = useRef<number | null>(null);
    const leaveRafRef = useRef<number | null>(null);

    const tiltEngine = useMemo<TiltEngine | null>(() => {
        if (!enableTilt) return null;

        let rafId: number | null = null;
        let running = false;
        let lastTs = 0;

        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;

        const DEFAULT_TAU = 0.12;
        const INITIAL_TAU = 0.6;
        let initialUntil = 0;

        const setVarsFromXY = (x: number, y: number): void => {
            const shell = shellRef.current;
            const wrap = wrapRef.current;
            if (!shell || !wrap) return;

            const width = shell.clientWidth || 1;
            const height = shell.clientHeight || 1;

            const percentX = clamp((100 / width) * x);
            const percentY = clamp((100 / height) * y);

            const centerX = percentX - 50;
            const centerY = percentY - 50;

            const properties: Record<string, string> = {
                '--pointer-x': `${percentX}%`,
                '--pointer-y': `${percentY}%`,
                '--rotate-x': `${round(-(centerX / 15))}deg`,
                '--rotate-y': `${round(centerY / 15)}deg`
            };

            for (const [k, v] of Object.entries(properties)) wrap.style.setProperty(k, v);
        };

        const step = (ts: number): void => {
            if (!running) return;
            if (lastTs === 0) lastTs = ts;
            const dt = (ts - lastTs) / 1000;
            lastTs = ts;

            const tau = ts < initialUntil ? INITIAL_TAU : DEFAULT_TAU;
            const k = 1 - Math.exp(-dt / tau);

            currentX += (targetX - currentX) * k;
            currentY += (targetY - currentY) * k;

            setVarsFromXY(currentX, currentY);

            const stillFar = Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05;

            if (stillFar || document.hasFocus()) {
                rafId = requestAnimationFrame(step);
            } else {
                running = false;
                lastTs = 0;
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            }
        };

        const start = (): void => {
            if (running) return;
            running = true;
            lastTs = 0;
            rafId = requestAnimationFrame(step);
        };

        return {
            setImmediate(x: number, y: number): void {
                currentX = x;
                currentY = y;
                setVarsFromXY(currentX, currentY);
            },
            setTarget(x: number, y: number): void {
                targetX = x;
                targetY = y;
                start();
            },
            toCenter(): void {
                const shell = shellRef.current;
                if (!shell) return;
                this.setTarget(shell.clientWidth / 2, shell.clientHeight / 2);
            },
            beginInitial(durationMs: number): void {
                initialUntil = performance.now() + durationMs;
                start();
            },
            getCurrent(): { x: number; y: number; tx: number; ty: number } {
                return { x: currentX, y: currentY, tx: targetX, ty: targetY };
            },
            cancel(): void {
                if (rafId) cancelAnimationFrame(rafId);
                rafId = null;
                running = false;
                lastTs = 0;
            }
        };
    }, [enableTilt]);

    // ... Event handlers (getOffsets, handlePointerMove, etc.)
    const getOffsets = (evt: PointerEvent, el: HTMLElement): { x: number; y: number } => {
        const rect = el.getBoundingClientRect();
        return { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
    };

    const handlePointerMove = useCallback(
        (event: PointerEvent): void => {
            const shell = shellRef.current;
            if (!shell || !tiltEngine) return;
            const { x, y } = getOffsets(event, shell);
            tiltEngine.setTarget(x, y);
        },
        [tiltEngine]
    );

    const handlePointerEnter = useCallback(
        (event: PointerEvent): void => {
            const shell = shellRef.current;
            if (!shell || !tiltEngine) return;

            shell.classList.add('active');
            if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);

            const { x, y } = getOffsets(event, shell);
            tiltEngine.setTarget(x, y);
        },
        [tiltEngine]
    );

    const handlePointerLeave = useCallback((): void => {
        const shell = shellRef.current;
        if (!shell || !tiltEngine) return;

        tiltEngine.toCenter();

        const checkSettle = (): void => {
            const { x, y, tx, ty } = tiltEngine.getCurrent();
            const settled = Math.hypot(tx - x, ty - y) < 0.6;
            if (settled) {
                shell.classList.remove('active');
                leaveRafRef.current = null;
            } else {
                leaveRafRef.current = requestAnimationFrame(checkSettle);
            }
        };
        if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
        leaveRafRef.current = requestAnimationFrame(checkSettle);
    }, [tiltEngine]);

    const handleDeviceOrientation = useCallback(
        (event: DeviceOrientationEvent): void => {
            const shell = shellRef.current;
            if (!shell || !tiltEngine) return;

            const { beta, gamma } = event;
            if (beta == null || gamma == null) return;

            const centerX = shell.clientWidth / 2;
            const centerY = shell.clientHeight / 2;
            const x = clamp(centerX + gamma * mobileTiltSensitivity, 0, shell.clientWidth);
            const y = clamp(
                centerY + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
                0,
                shell.clientHeight
            );

            tiltEngine.setTarget(x, y);
        },
        [tiltEngine, mobileTiltSensitivity]
    );

    useEffect(() => {
        if (!enableTilt || !tiltEngine) return;

        const shell = shellRef.current;
        if (!shell) return;

        const pointerMoveHandler = handlePointerMove as EventListener;
        const pointerEnterHandler = handlePointerEnter as EventListener;
        const pointerLeaveHandler = handlePointerLeave as EventListener;
        const deviceOrientationHandler = handleDeviceOrientation as EventListener;

        shell.addEventListener('pointerenter', pointerEnterHandler);
        shell.addEventListener('pointermove', pointerMoveHandler);
        shell.addEventListener('pointerleave', pointerLeaveHandler);

        const handleClick = (): void => {
            if (!enableMobileTilt || location.protocol !== 'https:') return;
            const anyMotion = window.DeviceMotionEvent as typeof DeviceMotionEvent & {
                requestPermission?: () => Promise<string>;
            };
            if (anyMotion && typeof anyMotion.requestPermission === 'function') {
                anyMotion
                    .requestPermission()
                    .then((state: string) => {
                        if (state === 'granted') {
                            window.addEventListener('deviceorientation', deviceOrientationHandler);
                        }
                    })
                    .catch(console.error);
            } else {
                window.addEventListener('deviceorientation', deviceOrientationHandler);
            }
        };
        shell.addEventListener('click', handleClick);

        const initialX = (shell.clientWidth || 0) - ANIMATION_CONFIG.INITIAL_X_OFFSET;
        const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
        tiltEngine.setImmediate(initialX, initialY);
        tiltEngine.toCenter();
        tiltEngine.beginInitial(ANIMATION_CONFIG.INITIAL_DURATION);

        return () => {
            shell.removeEventListener('pointerenter', pointerEnterHandler);
            shell.removeEventListener('pointermove', pointerMoveHandler);
            shell.removeEventListener('pointerleave', pointerLeaveHandler);
            shell.removeEventListener('click', handleClick);
            window.removeEventListener('deviceorientation', deviceOrientationHandler);
            if (enterTimerRef.current) window.clearTimeout(enterTimerRef.current);
            if (leaveRafRef.current) cancelAnimationFrame(leaveRafRef.current);
            tiltEngine.cancel();
            shell.classList.remove('active');
        };
    }, [
        enableTilt,
        enableMobileTilt,
        tiltEngine,
        handlePointerMove,
        handlePointerEnter,
        handlePointerLeave,
        handleDeviceOrientation
    ]);

    const cardRadius = '28px';

    return (
        <div
            ref={wrapRef}
            className={`relative touch-none ${className}`.trim()}
            style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d',
                '--rotate-x': '0deg',
                '--rotate-y': '0deg',
                '--pointer-x': '50%',
                '--pointer-y': '50%',
                width: '400px',
                height: '600px',
            } as React.CSSProperties}
        >
            {/* Behind Glow (Soft Shadow) */}
            {behindGlowEnabled && (
                <div
                    className="absolute inset-0 z-0 pointer-events-none transition-opacity duration-300 ease-out"
                    style={{
                        background: `radial-gradient(circle at 50% 50%, ${behindGlowColor} 0%, transparent ${behindGlowSize})`,
                        filter: 'blur(35px)',
                        opacity: 0.6,
                        transform: 'translateY(15px) scale(0.9)',
                    }}
                />
            )}

            {/* Main Card Shell - Liquid Glass Effect */}
            <div ref={shellRef} className="relative z-[1] h-full w-full group cursor-default">
                <div
                    className="relative h-full w-full overflow-hidden transition-all duration-300 ease-out"
                    style={{
                        borderRadius: cardRadius,
                        transform: 'rotateX(var(--rotate-y)) rotateY(var(--rotate-x))',
                        transformStyle: 'preserve-3d',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
                    }}
                >
                    <div className="absolute inset-0 z-0">

                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={name || "Profile"}
                                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black" />
                        )}
                    </div>

                    {/* Glossy Overlay / Reflection */}
                    <div
                        className="absolute inset-0 pointer-events-none z-[2]"
                        style={{
                            background: 'linear-gradient(125deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 40%, transparent 100%)',
                            opacity: 0.8
                        }}
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div
                        className="absolute inset-0 pointer-events-none z-[1]"
                        style={{
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)'
                        }}
                    />

                    {/* Content Section */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end h-full z-10">

                        {/* Name & Bio */}
                        <div className="mb-6 transform translate-y-2 transition-transform duration-300 group-hover:translate-y-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-2xl font-bold text-white tracking-wide drop-shadow-md">{name}</h2>
                                {/* Verified Badge Icon */}
                                <svg className="w-4 h-4 text-blue-400 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                            </div>
                            <p className="text-sm text-gray-200 font-medium leading-relaxed opacity-90 line-clamp-2 drop-shadow-sm">
                                {title}
                            </p>
                        </div>

                        {/* Footer: Stats & Action */}
                        <div className="flex items-center justify-between">
                            {/* Stats */}
                            <div className="flex items-center gap-4 text-white/90 text-xs font-semibold drop-shadow-sm">
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <span>{followers}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <span>{following}</span>
                                </div>
                            </div>

                            {/* Talk Button */}
                            <button
                                onClick={onContactClick}
                                className="
                                    group/btn relative overflow-hidden
                                    bg-white/10 backdrop-blur-md border border-white/20
                                    text-white px-5 py-2 rounded-full text-xs font-bold
                                    hover:bg-white/20 hover:border-white/40 transition-all duration-300
                                    shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)]
                                    active:scale-95 flex items-center gap-2
                                "
                            >
                                <span>Talk</span>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 group-hover/btn:animate-pulse">
                                    <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                                    <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 9.375v.375h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-.375c-3.328-.182-6-2.957-6-6.375v-1.5A.75.75 0 016 10.5z" />
                                </svg>
                                {/* Shine Effect */}
                                <div className="absolute inset-0 -translate-x-[100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const ProfileCard = React.memo(ProfileCardComponent);
export default ProfileCard;
