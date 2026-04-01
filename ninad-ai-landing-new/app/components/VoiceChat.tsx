'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuthStore } from '../lib/stores';
import { useRouter } from 'next/navigation';
import { getVoiceWsUrl } from '../lib/api';
import { openAppWebSocket } from '../lib/websocket';

interface VoiceChatProps {
  creatorId: string;
  creatorName: string;
  creatorImage: string;
  creatorRole: string;
  onClose: () => void;
}

type ChatState = 'connecting' | 'active' | 'ended' | 'error';

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function VoiceChat({
  creatorId,
  creatorName,
  creatorImage,
  creatorRole,
  onClose,
}: VoiceChatProps) {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();

  const [chatState, setChatState] = useState<ChatState>('connecting');
  const [elapsed, setElapsed] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(32).fill(4));
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const waveRafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectCountRef = useRef(0);
  const MAX_RECONNECTS = 3;

  // ─── Auth gate: redirect to login if not authenticated ───
  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      onClose();
      router.push('/login');
    }
  }, [isHydrated, isAuthenticated, onClose, router]);

  // ─── Smooth entrance ───
  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  // ─── Mouse parallax tracking ───
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // ─── WebSocket connection with auto-reconnect ───
  const connectWs = useCallback(() => {
    if (!isAuthenticated) return;

    const token = localStorage.getItem('ninad_access_token');
    const wsUrl = getVoiceWsUrl(creatorId) + (token ? `&token=${token}` : '');

    const ws = openAppWebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setChatState('active');
      reconnectCountRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data as string);
        if (data.type === 'audio') {
          // Play incoming audio (TTS response)
          setIsSpeaking(true);
          setTimeout(() => setIsSpeaking(false), 1500);
        }
        if (data.type === 'status') {
          if (data.status === 'speaking') setIsSpeaking(true);
          if (data.status === 'listening') setIsSpeaking(false);
        }
      } catch {
        // Binary audio data — handle playback
        setIsSpeaking(true);
        setTimeout(() => setIsSpeaking(false), 800);
      }
    };

    ws.onerror = () => {
      setChatState('error');
    };

    ws.onclose = () => {
      if (chatState === 'active' && reconnectCountRef.current < MAX_RECONNECTS) {
        reconnectCountRef.current += 1;
        reconnectRef.current = setTimeout(connectWs, 2000);
      }
    };
  }, [isAuthenticated, creatorId, chatState]);

  // ─── Start session ───
  useEffect(() => {
    if (!isAuthenticated) return;

    connectWs();
    startMicrophone();

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // ─── Timer ───
  useEffect(() => {
    if (chatState === 'active') {
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [chatState]);

  // ─── Microphone + Audio Analysis for Waveform ───
  const startMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.7;
      source.connect(analyser);
      analyserRef.current = analyser;

      animateWaveform();
    } catch {
      console.error('Microphone access denied');
    }
  };

  const animateWaveform = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);
      const bars = Array.from({ length: 32 }, (_, i) => {
        const idx = Math.floor((i / 32) * dataArray.length);
        return Math.max(4, (dataArray[idx] / 255) * 60);
      });
      setWaveformBars(bars);
      waveRafRef.current = requestAnimationFrame(draw);
    };

    waveRafRef.current = requestAnimationFrame(draw);
  };

  const cleanup = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (waveRafRef.current) cancelAnimationFrame(waveRafRef.current);
    if (reconnectRef.current) clearTimeout(reconnectRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  };

  const handleEndSession = () => {
    setIsExiting(true);
    cleanup();
    setChatState('ended');
    setTimeout(onClose, 500);
  };

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{
        opacity: isExiting ? 0 : isVisible ? 1 : 0,
        transform: isExiting ? 'scale(1.03)' : isVisible ? 'scale(1)' : 'scale(0.97)',
        transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" />

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-10%] left-[-10%] w-[70vw] h-[70vw] bg-primary/20 blur-[100px] mix-blend-screen"
          style={{
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            animation: 'voiceBlobMorph 8s ease-in-out infinite',
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-accent-blue/15 blur-[100px] mix-blend-screen"
          style={{
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
            animation: 'voiceBlobMorph 10s ease-in-out infinite reverse',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-lg px-6">
        {/* Creator Role */}
        <p className="text-primary-light text-xs font-bold tracking-[0.25em] uppercase mb-6 animate-fade-in-up">
          • {creatorRole}
        </p>

        {/* Central Orb / Avatar */}
        <div
          className="relative w-[240px] h-[240px] md:w-[320px] md:h-[320px] mb-10"
          style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)` }}
        >
          {/* Outer morphing glow ring */}
          <div
            className={`absolute inset-[-24px] transition-all duration-700 ${
              isSpeaking ? 'scale-110 opacity-80' : 'scale-100 opacity-40'
            }`}
            style={{
              background: `conic-gradient(from 0deg, var(--primary), var(--accent-blue), var(--primary-light), var(--primary))`,
              borderRadius: isSpeaking
                ? '60% 40% 30% 70% / 60% 30% 70% 40%'
                : '50%',
              filter: 'blur(20px)',
              animation: 'voiceBlobMorph 6s ease-in-out infinite',
            }}
          />

          {/* Inner glow */}
          <div
            className={`absolute inset-[-8px] rounded-full transition-all duration-500 ${
              isSpeaking ? 'opacity-60' : 'opacity-20'
            }`}
            style={{
              background: `radial-gradient(circle, var(--primary) 0%, transparent 70%)`,
              filter: 'blur(12px)',
            }}
          />

          {/* Avatar circle */}
          <div
            className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/20 shadow-2xl"
            style={{
              animation: 'voiceAvatarMorph 12s ease-in-out infinite alternate',
            }}
          >
            <Image
              src={creatorImage}
              alt={creatorName}
              fill
              className="object-cover scale-110"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 to-transparent pointer-events-none" />
          </div>

          {/* Status indicator */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full flex items-center gap-2.5 shadow-lg">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                isSpeaking
                  ? 'bg-green-400 shadow-[0_0_12px_#4ade80]'
                  : 'bg-accent-blue shadow-[0_0_12px_var(--accent-blue)]'
              }`}
            />
            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-white/80">
              {isSpeaking ? 'Speaking' : 'Listening'}
            </span>
          </div>
        </div>

        {/* Creator Name */}
        <h2 className="font-sans font-extrabold text-2xl md:text-3xl text-white tracking-tight mb-2">
          {creatorName}
        </h2>

        {/* Real-time Waveform */}
        <div className="flex items-end justify-center gap-[3px] h-16 mb-8">
          {waveformBars.map((height, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-75"
              style={{
                width: '3px',
                height: `${height}px`,
                background: isSpeaking
                  ? `linear-gradient(to top, var(--primary), var(--primary-light))`
                  : `linear-gradient(to top, var(--accent-blue), var(--accent-cyan))`,
                opacity: 0.6 + (height / 60) * 0.4,
              }}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center mb-10">
          <div className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-bold mb-1">
            Session Time
          </div>
          <div
            className="text-5xl md:text-6xl font-light tabular-nums tracking-tighter text-white/90"
            style={{
              textShadow: isSpeaking
                ? '0 0 40px rgba(97, 37, 216, 0.5)'
                : '0 0 30px rgba(0, 169, 255, 0.3)',
            }}
          >
            {formatTime(elapsed)}
          </div>
        </div>

        {/* End Session Button */}
        <button
          onClick={handleEndSession}
          className="group relative px-10 py-4 rounded-full font-sans font-bold text-base tracking-wide overflow-hidden transition-all duration-500 border border-white/15 hover:border-rose-500/50 hover:shadow-[0_0_40px_rgba(244,63,94,0.3)]"
        >
          <div className="absolute inset-0 bg-white/5 group-hover:bg-rose-500/20 transition-colors duration-500" />
          <span className="relative z-10 flex items-center gap-3 text-white/80 group-hover:text-rose-300 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            End Session
          </span>
        </button>

        {/* Connection Status */}
        {chatState === 'connecting' && (
          <div className="mt-6 flex items-center gap-2 text-white/40 text-xs">
            <div className="w-3 h-3 border border-white/30 border-t-primary rounded-full animate-spin" />
            Connecting...
          </div>
        )}
        {chatState === 'error' && (
          <div className="mt-6 flex items-center gap-2 text-rose-400/80 text-xs">
            <div className="w-2 h-2 bg-rose-500 rounded-full" />
            Connection error. Retrying...
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes voiceBlobMorph {
          0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          33% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
          66% { border-radius: 50% 50% 20% 80% / 25% 80% 20% 75%; }
          100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        }
        @keyframes voiceAvatarMorph {
          0% { border-radius: 50%; }
          25% { border-radius: 48% 52% 55% 45% / 52% 48% 52% 48%; }
          50% { border-radius: 52% 48% 45% 55% / 48% 52% 48% 52%; }
          75% { border-radius: 45% 55% 50% 50% / 55% 45% 55% 45%; }
          100% { border-radius: 50%; }
        }
      `}</style>
    </div>
  );
}
