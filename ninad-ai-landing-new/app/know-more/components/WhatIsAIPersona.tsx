"use client";

import React from "react";
import Image from "next/image";

export default function WhatIsAIPersona() {
  return (
    <section className="relative py-32 md:py-48 px-6 bg-[#05030b] overflow-hidden border-y border-white/5">
      {/* Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.02] whitespace-nowrap">
        <p className="text-[30vw] font-bold leading-none uppercase tracking-tighter">AUTHENTIC</p>
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column: Human Head Image */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-square rounded-3xl overflow-hidden group border border-white/10 bg-[#0a0a0f] shadow-2xl">
              {/* Subtle Background Glow */}
              <div className="absolute inset-0 bg-primary/5 blur-[100px] group-hover:bg-primary/10 transition-all duration-700" />

              {/* Image */}
              <div className="relative w-full h-full flex items-center justify-center p-8">
                <Image
                  src="/assets/know-more/human-head.png"
                  alt="Digital Soul"
                  fill
                  className="object-contain opacity-85 group-hover:opacity-100 brightness-105 contrast-110 transition-all duration-700"
                />
              </div>

              <div className="absolute inset-0 border border-white/10 rounded-3xl z-20 pointer-events-none" />
            </div>
          </div>

          {/* Right Column: High-End Typography */}
          <div className="lg:col-span-7 space-y-12">
            <div>
              <h2 className="font-sans font-bold text-5xl md:text-7xl text-white mb-6 tracking-tight">
                Beyond an Assistant.<br />
                <span className="text-primary-light">A Mirror of You.</span>
              </h2>
              <p className="font-roboto text-xl md:text-2xl text-white/50 leading-relaxed max-w-2xl">
                An AI Persona isn&apos;t just a chatbot. It&apos;s a digital reflection built on your actual voice, knowledge, and intuition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Voice DNA", text: "Captures the subtle nuances of how you speak and express ideas." },
                { title: "Knowledge Vault", text: "Trained on your specific expertise to provide authentic value." },
                { title: "Emotional Intelligence", text: "Maintains your unique personality and tone across every chat." },
                { title: "Verified Identity", text: "100% controlled by you. Your digital self, your rules." }
              ].map((item, i) => (
                <div
                  key={i}
                  className="space-y-3 group p-6 rounded-2xl border border-white/0 hover:border-white/5 hover:bg-white/[0.02] transition-all duration-500"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  <div className="w-10 h-0.5 bg-primary/40 group-hover:w-full transition-all duration-700" />
                  <h3 className="text-white font-bold text-xl group-hover:text-primary-light transition-colors">{item.title}</h3>
                  <p className="text-white/40 text-base leading-snug group-hover:text-white/70 transition-colors">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
