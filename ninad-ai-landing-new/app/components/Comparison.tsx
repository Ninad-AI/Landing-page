'use client';

import { useState } from 'react';
import Image from "next/image";

interface VoiceCardProps {
  title: string;
  subtitle: string;
  isPrimary?: boolean;
}

function VoiceCard({ title, subtitle, isPrimary = false }: VoiceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div
      className={`
        relative 
        w-full max-w-sm 
        aspect-[3/4] 
        rounded-[24px] 
        border 
        transition-all duration-500 
        group
        ${isPrimary 
          ? 'border-primary/50 bg-primary/5 shadow-[0_0_50px_-12px_var(--color-primary)] z-10 scale-105 md:scale-110' 
          : 'border-white/10 bg-white/5 hover:border-white/20'
        }
      `}
    >
      {/* Dynamic Background Glow */}
      <div className={`absolute inset-0 rounded-[24px] overflow-hidden opacity-20 pointer-events-none`}>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[80px] ${
            isPrimary ? 'bg-primary' : 'bg-gray-500'
        }`} />
      </div>

      <div className="relative h-full flex flex-col items-center justify-between p-8 md:p-10">
        
        {/* Top: Visualizer Area */}
        <div className="w-full h-1/2 flex items-center justify-center gap-1.5">
           {[...Array(8)].map((_, i) => (
             <div
                key={i}
                className={`
                    w-2 md:w-3 rounded-full transition-all duration-300
                    ${isPrimary ? 'bg-primary-light' : 'bg-white/40'}
                    ${isPlaying ? 'animate-pulse' : ''}
                `}
                style={{
                  height: isPlaying ? `${Math.random() * 80 + 20}%` : '20%',
                  opacity: isPlaying ? 1 : 0.5,
                  animationDelay: `${i * 0.1}s`
                }}
             />
           ))}
        </div>

        {/* Center: Play Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className={`
            w-20 h-20 md:w-24 md:h-24
            rounded-full
            flex items-center justify-center
            transition-transform duration-300 active:scale-95
            ${isPrimary 
              ? 'bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/40 hover:shadow-primary/60' 
              : 'bg-white/10 text-white hover:bg-white/20'
            }
          `}
        >
          {isPlaying ? (
             <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth={0} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24" strokeWidth={0} stroke="currentColor" className="w-8 h-8 md:w-10 md:h-10 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          )}
        </button>

        {/* Bottom: Text */}
        <div className="text-center mt-8">
             <h3 className={`font-sans font-bold text-lg md:text-xl tracking-wide uppercase ${isPrimary ? 'text-primary-light' : 'text-gray-400'}`}>
                 {title}
             </h3>
             <p className="font-roboto font-medium text-2xl md:text-3xl text-white mt-1">
                 {subtitle}
             </p>
        </div>
      </div>
    </div>
  );
}

export default function Comparison() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-black min-h-screen flex items-center">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 w-full h-[500px] bg-gradient-to-b from-primary/10 to-transparent opacity-30" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
            <h2 
            className="
                font-sans font-bold text-4xl md:text-6xl lg:text-[80px] 
                leading-none tracking-tight text-transparent bg-clip-text 
                bg-gradient-to-b from-white to-white/50 mb-6
            "
            >
            Hear the Difference
            </h2>
            <p className="font-roboto text-lg md:text-xl text-muted max-w-2xl mx-auto">
            Experience the clarity, emotion, and human-like quality that sets Ninad AI apart from standard market solutions.
            </p>
        </div>

        {/* Comparison Grid */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mt-12 mb-20">
          
          <VoiceCard 
            title="Standard AI" 
            subtitle="Generic"
          />

          <div className="relative z-20 flex-shrink-0 lg:-mx-4">
            <div className="w-16 h-16 rounded-full bg-black border border-white/20 flex items-center justify-center">
                <span className="font-mono text-white/50 font-bold italic text-xl">VS</span>
            </div>
          </div>

          <VoiceCard 
            title="Ninad AI" 
            subtitle="Human" 
            isPrimary
          />

        </div>
        
        {/* Bottom CTA or Info */}
        <div className="text-center">
            <p className="text-sm font-mono text-primary/80 uppercase tracking-widest">
                Optimized for ultra-low latency - 280ms
            </p>
        </div>

      </div>
    </section>
  );
}

