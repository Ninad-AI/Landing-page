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
}

const STATUS_BY_PHASE = {
  connecting: { dot: '#C0603C', label: 'Connecting…' },
  listening: { dot: '#7FD1A0', label: 'Listening…' },
  speaking: { dot: '#8E76BE', label: undefined },
} as const;

export default function VoiceSessionUI({
  callPhase,
  timeLeft,
  creatorName,
  creatorImage,
  onClose,
}: VoiceSessionUIProps) {
  const formatTime = (s: number) => {
    const t = Math.max(0, s);
    const m = Math.floor(t / 60);
    const sec = t % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const status = STATUS_BY_PHASE[callPhase];
  const statusLabel = status.label ?? `${creatorName.split(' ')[0]} is speaking`;

  return (
    <Ripple className="z-50 bg-nd-darker">
      <div className="relative h-full w-full px-4">
        {/* Anchored to the exact same center point Ripple uses for its rings (50%/50%),
            rather than being centered as part of a taller stack with the timer/status
            below it — otherwise the group's midpoint, not the photo's, lands on-center. */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full overflow-hidden scale-[0.85] sm:scale-95 md:scale-100"
          style={{
            width: 200,
            height: 200,
            boxShadow: 'inset 0 -18px 44px rgba(28,18,54,.35), 0 22px 60px -14px rgba(0,0,0,.5), 0 0 0 1px rgba(255,255,255,.08)',
          }}
        >
          <Image src={creatorImage} alt={creatorName} fill className="object-cover" sizes="200px" priority />
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-5"
          style={{ top: 'calc(50% + 140px)' }}
        >
          <span className="tabular-nums text-4xl font-light tracking-tight text-[#FAF8F4] sm:text-5xl">
            {formatTime(timeLeft)}
          </span>
          <div className="flex items-center gap-2 rounded-full bg-[#221E2C] px-4 py-2">
            <span
              className="h-1.5 w-1.5 rounded-full animate-nd-blink"
              style={{ background: status.dot }}
            />
            <span className="text-[13px] font-bold text-[#C9C3D1]">{statusLabel}</span>
          </div>
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close session"
          title="Close session"
          className="fixed top-4 right-4 z-[60] inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/8 backdrop-blur-md text-white/70 hover:bg-white/15 hover:text-white transition-all duration-300 sm:top-6 sm:right-6"
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
