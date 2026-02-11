"use client";

import React from "react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-32 md:py-48 px-6 bg-[#05030b] overflow-hidden border-t border-white/5">
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          {/* Left Column: Fixed Header */}
          <div className="lg:w-1/3 lg:sticky lg:top-32 space-y-8 group">
            <div className="inline-block px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold tracking-[0.3em] uppercase transition-all duration-500 group-hover:bg-primary/20">
              How It Works
            </div>
            <h2 className="font-sans font-bold text-5xl md:text-7xl text-white leading-[0.9] tracking-tighter transition-all duration-500 group-hover:translate-x-2">
              A Path to <br />
              <span className="italic text-primary-light">Ascension.</span>
            </h2>
            <p className="font-roboto text-xl text-white/40 leading-relaxed max-w-sm">
              Transforming your digital legacy into a living, breathing persona takes four deliberate steps.
            </p>
          </div>

          {/* Right Column: Scrolling Steps */}
          <div className="lg:w-2/3 space-y-32">
            {[
              {
                num: "01",
                title: "Deep Ingestion",
                desc: "Our neural engines analyze your existing content—videos, writing, voice, and unique mannerisms—to understand your linguistic DNA."
              },
              {
                num: "02",
                title: "Verification & Shaping",
                desc: "Interact with your nascent persona in a secure environment. Refine its responses, set ethical boundaries, and ensure it represents you with 100% fidelity."
              },
              {
                num: "03",
                title: "Gateway Deployment",
                desc: "Once you approve, we deploy your unique portal. A simple link allows your global audience to connect with you through our high-fidelity interface."
              },
              {
                num: "04",
                title: "Exponential Resonance",
                desc: "Scale your impact. While you focus on creating, your digital self generates passive revenue and builds deep community loyalty with every word."
              }
            ].map((step, i) => (
              <div key={i} className="group flex flex-col md:flex-row gap-8 md:gap-16 items-start transition-all duration-700 hover:opacity-100">
                <div className="text-white/10 text-8xl md:text-9xl font-bold font-sans tracking-tighter transition-all duration-700 group-hover:text-primary group-hover:scale-110 leading-none">
                  {step.num}
                </div>
                <div className="space-y-6 pt-2">
                  <h3 className="text-white font-bold text-3xl md:text-5xl tracking-tight transition-all duration-500 group-hover:translate-x-4">
                    {step.title}
                  </h3>
                  <div className="w-12 h-1 bg-primary/20 group-hover:w-full transition-all duration-700" />
                  <p className="text-white/50 text-xl leading-relaxed max-w-xl transition-colors duration-500 group-hover:text-white/80">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
