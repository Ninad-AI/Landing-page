"use client";

import React from "react";
import Image from "next/image";

const REASONS = [
  {
    title: "Scales your time without burning out",
    desc: "Automate engagements and maximize your impact, allowing you to scale effectively without overwhelming yourself.",
  },
  {
    title: "Deeper connection with followers",
    desc: "Experience meaningful interactions that forge strong bonds with your audience, transforming followers into a community.",
  },
  {
    title: "Adds new layers to your digital presence",
    desc: "Enhance your online persona with innovative tools that expand your reach and amplify your distinctive voice.",
  },
  {
    title: "Turns attention into income",
    desc: "Leverage your audience's attention to generate income through strategic engagement and monetization techniques.",
  }
];

export default function WhyCreatorsLoveThis() {
  return (
    <section className="relative py-20 md:py-32 px-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 right-[-20%] w-[60%] h-[60%] -z-10 opacity-30 blur-3xl">
        <div className="w-full h-full bg-gradient-to-tl from-primary/40 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Title and Visual */}
          <div className="relative flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="mb-8 md:mb-12">
              <p className="font-mono font-medium text-4xl md:text-[58px] text-[#fffafa] leading-tight">
                Why
              </p>
              <p className="text-5xl md:text-[75px] font-bold text-white font-hand leading-tight">
                Creators
              </p>
              <p className="font-mono font-bold text-4xl md:text-[58px] text-[#fffafa]">
                loves this
              </p>
            </div>
            
            {/* Scribble Visual */}
            <div className="relative w-[250px] h-[250px] md:w-[300px] md:h-[300px]">
              <Image
                src="/assets/know-more/scribbl.png"
                alt=""
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Right: Grid of Reasons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {REASONS.map((reason, index) => (
              <div 
                key={index} 
                className="relative p-5 md:p-6 flex flex-col space-y-3 group bg-gradient-to-br from-white/95 to-white/90 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                <h3 className="font-mono font-bold text-base md:text-lg text-black leading-tight">
                  {reason.title}
                </h3>
                <p className="font-mono font-normal text-sm md:text-[15px] text-black/80 tracking-tight leading-snug">
                  {reason.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
