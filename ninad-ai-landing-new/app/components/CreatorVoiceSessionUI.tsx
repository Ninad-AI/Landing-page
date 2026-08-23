'use client';

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
  const orbDuration = callPhase === 'speaking' ? '1.5s' : '3.6s';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-nd-darker">
      <div className="relative flex h-full w-full flex-col items-center justify-center px-4">
        <div className="relative flex items-center justify-center scale-[0.72] sm:scale-90 md:scale-100" style={{ width: 300, height: 300 }}>
          <span
            className="absolute rounded-full animate-nd-ripple"
            style={{ width: 250, height: 250, border: '1px solid rgba(142,118,190,.5)' }}
          />
          <span
            className="absolute rounded-full animate-nd-ripple"
            style={{ width: 250, height: 250, border: '1px solid rgba(142,118,190,.4)', animationDelay: '1.7s' }}
          />
          <span
            className="absolute rounded-full animate-nd-spin"
            style={{
              width: 270,
              height: 270,
              background:
                'conic-gradient(from 0deg, rgba(142,118,190,.42), rgba(107,75,168,.05), rgba(192,96,60,.3), rgba(142,118,190,.42))',
              filter: 'blur(32px)',
            }}
          />
          <span
            className="relative rounded-full"
            style={{
              width: 200,
              height: 200,
              background: 'radial-gradient(120% 120% at 32% 26%, #C9B6EC 0%, #8E76BE 42%, #5A3E96 78%, #3E2A6B 100%)',
              boxShadow: 'inset 0 -18px 44px rgba(28,18,54,.6), 0 22px 60px -14px rgba(107,75,168,.65)',
              animation: `nd-breathe ${orbDuration} ease-in-out infinite`,
            }}
          />
          <span
            className="absolute rounded-full pointer-events-none"
            style={{ width: 58, height: 38, background: 'rgba(255,255,255,.34)', filter: 'blur(14px)', transform: 'translate(-34px, -52px)' }}
          />
        </div>

        <div className="mt-10 flex flex-col items-center gap-5 sm:mt-12">
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
    </div>
  );
}
