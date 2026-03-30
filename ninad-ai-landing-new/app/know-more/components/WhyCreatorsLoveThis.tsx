"use client";

import React from "react";
import Link from "next/link";

export default function WhyCreatorsLoveThis() {
  return (
    <section className="relative py-16 sm:py-20 md:py-32 lg:py-48 px-4 sm:px-6 md:px-10 bg-[#05030b] overflow-hidden border-t border-white/5">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-primary/10 rounded-full blur-[160px] pointer-events-none opacity-20" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-14 lg:gap-20 items-center">
          {/* Left: Core Narrative */}
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            <div className="space-y-4 sm:space-y-6">
              <p className="text-xs font-mono text-white/30 uppercase tracking-[0.4em]">The Endgame</p>
              <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white leading-tight tracking-tighter">
                You. Everywhere. <span className="text-primary-light">Always.</span>
              </h2>
            </div>
            <div className="space-y-5 sm:space-y-6 md:space-y-8">
              {[
                { label: "Your Voice", desc: "Encoded in every response. No compromise on authenticity." },
                { label: "Your Knowledge", desc: "Becomes a 24/7 asset generating passive value streams." },
                { label: "Your Control", desc: "Not a black box. You maintain sovereign custody forever." }
              ].map((item, i) => (
                <div key={i} className="pb-5 sm:pb-6 md:pb-8">
                  <p className="text-white/40 text-xs uppercase tracking-[0.3em] font-mono mb-2">{item.label}</p>
                  <p className="text-white/60 text-base sm:text-lg leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Action & Metrics */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 md:p-12 space-y-8 sm:space-y-10 md:space-y-12">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-sans font-bold text-2xl sm:text-3xl text-white">Ready?</h3>
              <p className="text-white/40 text-base sm:text-lg leading-relaxed">
                Join founders and creators who are already scaling their presence without sacrificing control.
              </p>
            </div>

            <div className="space-y-4">
              <button className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-primary hover:bg-primary-light text-black font-bold text-base sm:text-lg rounded-xl transition-all duration-300 hover:shadow-[0_0_60px_rgba(var(--primary-rgb),0.4)] active:scale-95">
                Start Building
              </button>
              <Link href="/book-demo" className="block">
                <button className="w-full px-6 sm:px-8 py-4 sm:py-5 border border-white/20 hover:border-white/40 text-white font-bold text-base sm:text-lg rounded-xl transition-all duration-300 hover:bg-white/5">
                  Book Demo
                </button>
              </Link>
            </div>


          </div>
        </div>

      </div>
    </section>
  );
}
