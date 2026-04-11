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
  isMicMuted?: boolean;
  onToggleMic?: () => void;
}

export default function VoiceSessionUI({
  isSpeaking,
  callPhase,
  timeLeft,
  totalTime,
  creatorName,
  creatorImage,
  isMicMuted = false,
  onToggleMic,
}: VoiceSessionUIProps) {
  const RING_SIZE = 280;
  const IMG_SIZE = 216;
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

  const statusDotColor = callPhase === 'connecting'
    ? { ping: 'bg-amber-400', dot: 'bg-amber-500' }
    : { ping: 'bg-rose-400', dot: 'bg-rose-500' };

  return (
    <Ripple
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
      color="rgba(255, 255, 255, 0.15)"
      mainCircleSize={IMG_SIZE}
      numCircles={8}
    >



      {/* Main layout */}
      <div className="relative flex h-full w-full items-center justify-center">
        <div
          className="relative flex items-center justify-center"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          {/* Progress ring SVG */}
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

          {/* Creator image */}
          <div
            className="relative overflow-hidden rounded-full border-2 border-white/10 bg-slate-900 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            style={{ width: IMG_SIZE, height: IMG_SIZE }}
          >
            <Image
              src={creatorImage}
              alt={creatorName}
              fill
              className="object-cover"
              priority
            />
            {/* Speaking overlay */}
            <div
              className={`absolute inset-0 bg-rose-500/20 transition-opacity duration-700 ${isSpeaking ? 'opacity-30' : 'opacity-0'}`}
            />
          </div>

          {/* Controls below the circle */}
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 translate-y-38.75 flex-col items-center gap-8">
            {/* Timer */}
            <span className="tabular-nums text-5xl font-extralight tracking-tight text-white/95 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] sm:text-6xl">
              {formatTime(timeLeft)}
            </span>

            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="relative flex h-1.5 w-1.5">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${statusDotColor.ping}`} />
                <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${statusDotColor.dot}`} />
              </span>
              <span className="text-[11px] font-light uppercase tracking-[0.6em] text-white/40">
                {callPhase}
              </span>
            </div>

            {onToggleMic && (
              <button
                type="button"
                onClick={onToggleMic}
                aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                title={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                className={`group relative inline-flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 sm:h-14 sm:w-14 ${
                  isMicMuted
                    ? 'border-rose-200/55 bg-rose-400/20 text-rose-100 shadow-[0_0_24px_rgba(251,113,133,0.24)] hover:bg-rose-400/30'
                    : 'border-white/35 bg-white/12 text-white/90 shadow-[0_0_20px_rgba(255,255,255,0.14)] hover:bg-white/18'
                }`}
              >
                <span className="pointer-events-none absolute inset-1 rounded-full border border-white/20" />
                {isMicMuted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 h-5 w-5 sm:h-6 sm:w-6">
                    <path d="M12 5a3 3 0 0 1 3 3v4a3 3 0 0 1-5.54 1.64" />
                    <path d="M17 10v2a5 5 0 0 1-8.8 3.2" />
                    <path d="M7 10v2" />
                    <path d="M12 19v3" />
                    <path d="M9 22h6" />
                    <path d="m4 4 16 16" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="relative z-10 h-5 w-5 sm:h-6 sm:w-6">
                    <rect x="9" y="3" width="6" height="12" rx="3" />
                    <path d="M5 10v2a7 7 0 0 0 14 0v-2" />
                    <path d="M12 19v3" />
                    <path d="M9 22h6" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Ripple>
  );
}
