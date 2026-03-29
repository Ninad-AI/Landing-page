'use client';

import Image from 'next/image';
import Ripple from './ui/Ripple';

interface VoiceSessionUIProps {
  isSpeaking: boolean;
  callPhase: 'connecting' | 'listening' | 'speaking';
  timeLeft: number;
  totalTime: number;
  onEndCall: () => void;
  creatorName: string;
  creatorImage: string;
}

export default function VoiceSessionUI({
  isSpeaking,
  callPhase,
  timeLeft,
  totalTime,
  onEndCall,
  creatorName,
  creatorImage,
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
          <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 translate-y-[155px] flex-col items-center gap-8">
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
          </div>
        </div>
      </div>
    </Ripple>
  );
}
