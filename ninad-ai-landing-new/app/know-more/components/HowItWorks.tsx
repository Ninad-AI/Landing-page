"use client";

import React from "react";
import Image from "next/image";

const CARDS = [
  {
    icon: "/assets/know-more/1.png",
    text: "We build your AI persona using approved content",
  },
  {
    icon: "/assets/know-more/2.png",
    text: "You review and control what it can say",
  },
  {
    icon: "/assets/know-more/3.png",
    text: "Add a single link to your bio",
  },
  {
    icon: "/assets/know-more/4.png",
    text: "Fans pay to talk, you earn",
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 md:py-32 px-6 overflow-hidden bg-white">
      {/* Topographic Background */}
      <div className="absolute inset-0 -z-10 pointer-events-none opacity-60">
        <Image
          src="/assets/know-more/scribblbg.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="container mx-auto max-w-[1400px]">
        <div className="mb-16 md:mb-20">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-black/25 backdrop-blur-md rounded-lg -z-10 scale-110"></div>
            <h2 className="font-roboto font-semibold text-4xl md:text-[56px] text-black px-6 py-2">
              How it works ?
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CARDS.map((card, index) => (
            <div 
              key={index} 
              className="relative bg-black rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl min-h-[320px] justify-between"
            >
              {/* White Circular Icon Container */}
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center mb-8">
                <div className="relative w-10 h-10 md:w-12 md:h-12">
                  <Image
                    src={card.icon}
                    alt=""
                    fill
                    className="object-contain"
                  />
                </div>
              </div>

              <p className="font-roboto font-bold text-lg md:text-2xl text-white leading-snug">
                {card.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
