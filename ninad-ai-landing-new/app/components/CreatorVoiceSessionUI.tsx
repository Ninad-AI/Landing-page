'use client';

import Image from 'next/image';
import Ripple from './ui/Ripple';

interface VoiceSessionUIProps {
  isSpeaking: boolean;
  callPhase: 'connecting' | 'listening' | 'speaking';
  timeLeft: number;
  totalTime: number;
  creatorName: string;
  creatorImage: string;
  onClose?: () => void;
  /** When true, renders a hold-to-talk button and the mic only streams while it's held. */
  pushToTalk?: boolean;
  isPttActive?: boolean;
  onPttPress?: () => void;
  onPttRelease?: () => void;
  /** True between releasing the button and the agent's response actually starting. */
  isAwaitingResponse?: boolean;
}

export default function VoiceSessionUI({
  isSpeaking,
  callPhase,
  timeLeft,
  totalTime,
  creatorName,
  creatorImage,
  onClose,
  pushToTalk = false,
  isPttActive = false,
  onPttPress,
  onPttRelease,
  isAwaitingResponse = false,
}: VoiceSessionUIProps) {
  const RING_SIZE = 240;
  const IMG_SIZE = 180;
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  const radius = IMG_SIZE / 2 + 10;
  const circumference = 2 * Math.PI * radius;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const dashOffset = circumference * (1 - progress);

  const formatTime = (s: number) => {
    const t = Math.max(0, s);
    const m = Math.floor(t / 60);
    const sec = t % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  // Held while the agent is still talking counts as "queued" (waiting for it
  // to be safe to actually capture) — the button/status shouldn't look
  // "listening" while nothing is actually being captured yet. A press during
  // "thinking" is NOT queued (it starts a new turn), so it isn't included.
  const pttQueued = isPttActive && isSpeaking;
  const pttListening = isPttActive && !pttQueued;

  // In push-to-talk mode the mic is muted except while the button is held, so the
  // status readout reflects that instead of the raw (always-on-VAD) call phase.
  const effectivePhase = pushToTalk
    ? isSpeaking
      ? 'speaking'
      : pttListening
      ? 'listening'
      : isAwaitingResponse
      ? 'thinking'
      : callPhase === 'connecting'
      ? 'connecting'
      : 'idle'
    : callPhase;

  const phaseLabel = effectivePhase === 'idle' ? 'hold to talk' : effectivePhase;

  const statusDotColor = effectivePhase === 'connecting' || effectivePhase === 'thinking'
    ? { ping: 'bg-amber-400', dot: 'bg-amber-500' }
    : effectivePhase === 'listening'
    ? { ping: 'bg-emerald-400', dot: 'bg-emerald-500' }
    : effectivePhase === 'speaking'
    ? { ping: 'bg-rose-400', dot: 'bg-rose-500' }
    : { ping: 'bg-white/30', dot: 'bg-white/40' };

  return (
    <Ripple
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      color="rgba(255, 255, 255, 0.15)"
      mainCircleSize={IMG_SIZE}
      numCircles={8}
    >

      <div className="relative flex h-full w-full items-center justify-center px-4">
        <div
          className="relative flex items-center justify-center scale-[0.85] sm:scale-100"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          <svg
            className="absolute inset-0 -rotate-90 overflow-visible"
            width={RING_SIZE}
            height={RING_SIZE}
          >
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="3"
              fill="transparent"
            />
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            />
          </svg>

          <div
            className="relative overflow-hidden rounded-full border-2 border-white/10 bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            style={{ width: IMG_SIZE, height: IMG_SIZE }}
          >
            <Image
  src={creatorImage}
  alt={creatorName}
  width={1200}           // Use actual large size
  height={800}
  className="w-full h-auto object-cover"
  priority
  quality={100}
/>
            <div
              className={`absolute inset-0 bg-rose-500/20 transition-opacity duration-700 ${isSpeaking ? 'opacity-30' : 'opacity-0'}`}
            />
          </div>

          <div
            className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 flex-col items-center ${
              pushToTalk ? 'translate-y-24 gap-3 sm:translate-y-32 sm:gap-4' : 'translate-y-32 gap-4 sm:translate-y-44 sm:gap-6'
            }`}
          >
            <span className="tabular-nums text-3xl font-extralight tracking-tight text-white/95 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] sm:text-6xl">
              {formatTime(timeLeft)}
            </span>

            {pushToTalk ? (
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <style>{`
                  @keyframes ptt-breathe {
                    0%, 100% { transform: scale(1); box-shadow: 0 6px 24px rgba(0,0,0,0.45), 0 0 0 0 rgba(255,255,255,0.10); }
                    50% { transform: scale(1.05); box-shadow: 0 6px 24px rgba(0,0,0,0.45), 0 0 0 10px rgba(255,255,255,0.03); }
                  }
                  @keyframes ptt-ring-out {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    100% { transform: scale(2.1); opacity: 0; }
                  }
                `}</style>

                <div className="relative flex items-center justify-center">
                  {pttListening && (
                    <>
                      <span
                        className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-400/60"
                        style={{ animation: 'ptt-ring-out 1.4s ease-out infinite' }}
                      />
                      <span
                        className="pointer-events-none absolute inset-0 rounded-full border-2 border-emerald-400/60"
                        style={{ animation: 'ptt-ring-out 1.4s ease-out infinite', animationDelay: '0.45s' }}
                      />
                    </>
                  )}

                  <button
                    type="button"
                    aria-pressed={isPttActive}
                    aria-label={pttListening ? 'Release to send' : pttQueued ? 'Waiting for the agent to finish' : 'Hold to talk (or hold space)'}
                    disabled={callPhase === 'connecting'}
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      onPttPress?.();
                    }}
                    onPointerUp={(e) => {
                      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* ignore */ }
                      onPttRelease?.();
                    }}
                    onPointerCancel={() => onPttRelease?.()}
                    onPointerLeave={() => onPttRelease?.()}
                    onContextMenu={(e) => e.preventDefault()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.repeat) {
                        e.preventDefault();
                        onPttPress?.();
                      }
                    }}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        onPttRelease?.();
                      }
                    }}
                    className={`relative flex h-14 w-14 select-none items-center justify-center rounded-full border backdrop-blur-md transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:h-16 sm:w-16 ${
                      pttListening
                        ? 'border-emerald-300/70 bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-[0_0_35px_rgba(16,185,129,0.5)]'
                        : pttQueued
                        ? 'border-amber-300/50 bg-amber-500/15 text-amber-100/90'
                        : 'border-white/20 bg-white/10 text-white/85 hover:bg-white/15'
                    }`}
                    style={{
                      touchAction: 'none',
                      transition: 'transform 150ms ease-out, box-shadow 150ms ease-out, background-color 150ms ease-out',
                      transform: pttListening ? 'scale(1.08)' : undefined,
                      animation: pttQueued
                        ? 'ptt-breathe 1s ease-in-out infinite'
                        : isPttActive || callPhase === 'connecting'
                        ? 'none'
                        : 'ptt-breathe 2.8s ease-in-out infinite',
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 sm:h-7 sm:w-7">
                      <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
                      <path d="M12 18v3" />
                      <path d="M9 21h6" />
                    </svg>
                  </button>
                </div>

                <span
                  className={`font-roboto text-[10px] font-medium uppercase tracking-[0.4em] sm:text-[11px] sm:tracking-[0.6em] ${
                    effectivePhase === 'speaking'
                      ? 'text-rose-300/80'
                      : effectivePhase === 'listening'
                      ? 'text-emerald-300'
                      : effectivePhase === 'thinking' || effectivePhase === 'connecting'
                      ? 'text-amber-400/70'
                      : 'text-white/40'
                  }`}
                >
                  {phaseLabel}
                </span>

                {effectivePhase === 'idle' && (
                  <span className="hidden font-roboto text-[9px] font-normal normal-case tracking-normal text-white/30 sm:block">
                    or hold space
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="relative flex h-2 w-2 sm:h-1.5 sm:w-1.5">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusDotColor.ping}`} />
                  <span className={`relative inline-flex h-2 w-2 sm:h-1.5 sm:w-1.5 rounded-full ${statusDotColor.dot}`} />
                </span>
                <span className="text-[10px] sm:text-[11px] font-light uppercase tracking-[0.4em] sm:tracking-[0.6em] text-white/40">
                  {phaseLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close session"
          title="Close session"
          className="fixed top-4 right-4 z-[60] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 backdrop-blur-md text-white/70 hover:bg-white/15 hover:text-white transition-all duration-300 shadow-[0_0_16px_rgba(0,0,0,0.3)] sm:top-6 sm:right-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </Ripple>
  );
}
