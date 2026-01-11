"use client";

import React from "react";
import Image from "next/image";

export default function WhatIsAIPersona() {
  return (
    <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 px-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[10%] left-[-20%] w-[60%] h-[60%] -z-10 opacity-40 blur-3xl">
        <div className="w-full h-full bg-gradient-to-br from-primary/50 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side: Text */}
          <div className="space-y-12">
            <div className="text-white">
              <p className="font-roboto text-4xl md:text-[60px] leading-tight">What is an</p>
              <p className="text-6xl md:text-[100px] lg:text-[120px] font-bold text-white tracking-tight font-hand mt-[-10px]">
                AI persona ?
              </p>
            </div>

            <div className="max-w-[650px] space-y-8">
              <p className="font-sans text-xl md:text-[24px] leading-relaxed text-[#dfdfdf]">
                An <span className="font-bold text-white">AI persona</span> is a <span className="font-bold text-white">digital version</span> <span className="font-bold text-white">of you</span> that reflects your voice, personality, and knowledge so followers can talk to you anytime, even when youre offline.
              </p>
              <p className="font-sans text-2xl md:text-[27px] font-normal text-white">
                Think of it as you, available 24/7.
              </p>
            </div>
          </div>

          {/* Right side: Human Head Image */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-[350px] h-[350px] md:w-[600px] md:h-[600px] lg:w-[800px] lg:h-[800px] lg:mr-[-100px]">
              <Image
                src="/assets/know-more/human-head.png"
                alt="AI Persona"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Wave Transition */}
      <div className="absolute bottom-0 left-0 w-full leading-none">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 120V37.5C120 12.5 240 -12.5 360 7.5C480 27.5 600 92.5 720 102.5C840 112.5 960 67.5 1080 37.5C1200 7.5 1320 -7.5 1440 12.5V120H0Z" fill="#6125d8" />
        </svg>
      </div>
    </section>
  );
}
