'use client';

import { useState } from 'react';
import Image from "next/image";

const FIGMA_NOISE_TEXTURE = '/assets/figma/comparison/noise-texture.png';
const FIGMA_TEXT_LOGO = '/assets/figma/comparison/text-logo.png';
const FIGMA_PLAY_CENTER = '/assets/figma/comparison/play-center.svg';
const FIGMA_PLAY_SIDE_LEFT = '/assets/figma/comparison/play-side-left.svg';
const FIGMA_PLAY_SIDE_RIGHT = '/assets/figma/comparison/play-side.svg';

interface VoiceCardProps {
  title: string;
  subtitle: string;
  isPrimary?: boolean;
}

function VoiceCard({ title, subtitle, isPrimary = false }: VoiceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const isCenter = title === 'NINAD AI';

  const variant = (() => {
    switch (title) {
      case 'ORIGINAL':
        return {
          gradient: 'bg-gradient-to-br from-[#E3F7F4] via-[#CFEAEC] to-[#90BFD2]',
          titleClass: 'text-[#00A5FF]/80',
          playSrc: FIGMA_PLAY_SIDE_LEFT,
          playSize: 89
        };
      case 'NINAD AI':
        return {
          gradient: 'bg-gradient-to-br from-[#EEF1F8] via-[#D5D5F1] to-[#9A79E6]',
          titleClass: 'text-[#6125D8]',
          playSrc: FIGMA_PLAY_CENTER,
          playSize: 105
        };
      case 'MARKET':
        return {
          gradient: 'bg-gradient-to-br from-[#EAF3FB] via-[#BBD4F5] to-[#6E8ED8]',
          titleClass: 'text-[#00A5FF]/80',
          playSrc: FIGMA_PLAY_SIDE_RIGHT,
          playSize: 89
        };
      default:
        return {
          gradient: 'bg-gray-200',
          titleClass: 'text-gray-800',
          playSrc: FIGMA_PLAY_SIDE_RIGHT,
          playSize: 89
        };
    }
  })();

  const outerSize = isPrimary ? 'max-w-[375px] h-[477px]' : 'max-w-[360px] h-[450px]';
  const topPanelHeight = isPrimary ? 'h-[364px]' : 'h-[327px]';
  const subtitleClass = 'text-black/60';

  return (
    <div
      className={`relative w-full ${outerSize} rounded-[20px] bg-[#E0EBF6] ${
        isPrimary ? 'lg:scale-110 shadow-[0_24px_60px_rgba(0,0,0,0.45)] z-20' : 'shadow-[0_20px_50px_rgba(0,0,0,0.35)]'
      }`}
    >
      <div className="p-3">
        {/* Inner glass panel (Figma V5) */}
        <div className={`relative w-full ${topPanelHeight} rounded-[15px] border-2 border-white bg-white/75 overflow-hidden`}>
          <div className={`absolute inset-0 ${variant.gradient}`} />
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.08] bg-repeat bg-size-[1738px_1738px] pointer-events-none"
            style={{ backgroundImage: `url('${FIGMA_NOISE_TEXTURE}')` }}
          />

          <button
            type="button"
            aria-pressed={isPlaying}
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 active:scale-95 transition-transform"
          >
            <Image src={variant.playSrc} alt="Play" width={variant.playSize} height={variant.playSize} />
          </button>
        </div>

        {/* Bottom labels */}
        <div className="pt-3 pb-3 text-center">
          {isCenter ? (
            <div className="mx-auto relative w-51.25 h-12.5">
              <Image src={FIGMA_TEXT_LOGO} alt="Ninad AI" fill className="object-contain" />
            </div>
          ) : (
            <div className={`font-sans font-extrabold text-[40px] leading-none tracking-[-0.02em] ${variant.titleClass}`}>{title}</div>
          )}
          <div className={`font-sans font-extrabold text-[40px] leading-none tracking-[-0.02em] ${subtitleClass}`}>{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

export default function Comparison() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-black min-h-screen flex items-center">
      {/* Background Glows (Recreating Figma nodes 292:393 and 292:394) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large Central Background Glow (node 292:393) */}
        <div 
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-250 h-250 bg-[#1A0B2E] rounded-full blur-[180px] opacity-40"
          style={{ mixBlendMode: 'plus-lighter' }}
        />
        
        {/* Top Glow Effect (node 292:394) */}
        <div 
          className="absolute left-[20%] -top-25 w-150 h-125 bg-primary/20 rounded-full blur-[140px] opacity-50"
          style={{ rotate: '15deg' }}
        />

        {/* Subtle Bottom Glow */}
        <div 
          className="absolute right-[10%] -bottom-50 w-200 h-150 bg-[#0F0524] rounded-full blur-[160px] opacity-30"
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
            <h2 
            className="
                font-sans font-black text-4xl md:text-6xl lg:text-[110px] 
                leading-none tracking-tighter text-transparent bg-clip-text 
              bg-linear-to-b from-white via-white/90 to-white/40 mb-4
            "
            >
            VOICE COMPARISON
            </h2>
            <p className="font-sans text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Listen to the difference. Our AI captures the soul of the original voice.
            </p>
            
            {/* <button className="bg-white text-black font-sans font-bold px-10 py-4 rounded-full hover:bg-gray-100 transition-all flex items-center justify-center gap-2 mx-auto text-base shadow-[0_4px_20px_rgba(255,255,255,0.2)] group">
              Create Your Clone 
              <span className="transition-transform group-hover:translate-x-1 text-xl">→</span>
            </button> */}
        </div>

        {/* Comparison Grid */}
        <div className="flex flex-col lg:flex-row items-end justify-center gap-4 lg:gap-10 mt-16">
          
          <VoiceCard 
            title="ORIGINAL" 
            subtitle="VOICE"
          />

          <VoiceCard 
            title="NINAD AI" 
            subtitle="CLONE" 
            isPrimary
          />

          <VoiceCard 
            title="MARKET" 
            subtitle="CLONE"
          />

        </div>

      </div>
    </section>
  );
}

