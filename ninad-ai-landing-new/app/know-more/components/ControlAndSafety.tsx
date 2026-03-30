"use client";

import React from "react";

export default function ControlAndSafety() {
  return (
    <section className="relative py-16 sm:py-24 md:py-32 lg:py-48 px-4 sm:px-6 md:px-10 bg-[#05030b] overflow-hidden border-t border-white/5">
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="mb-10 sm:mb-14 md:mb-20 lg:mb-24 space-y-3 sm:space-y-4">
          <p className="text-xs font-mono text-white/30 uppercase tracking-[0.4em]">How We Protect You</p>
          <h2 className="font-sans font-bold text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-white tracking-tighter">
            Immutable <span className="text-primary-light">Safety.</span>
          </h2>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-5xl">
          {[
            { 
              title: "Your Approval", 
              desc: "Your signature required. Nothing goes out without you."
            },
            { 
              title: "Instant Control", 
              desc: "Disconnect everything instantly with one command."
            },
            { 
              title: "Your Knowledge", 
              desc: "What you create stays yours. Forever yours."
            },
            { 
              title: "Only You", 
              desc: "Locked to your identity. Biometrically secure."
            },
            { 
              title: "Bank-Level Security", 
              desc: "Military-grade encryption on every message."
            },
            { 
              title: "Complete Transparency", 
              desc: "Every action logged. You see everything."
            }
          ].map((feature, i) => (
            <div 
              key={i} 
              className="group p-5 sm:p-6 md:p-8 rounded-2xl border border-white/10 hover:border-primary/50 bg-white/[0.01] hover:bg-primary/5 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0 group-hover:scale-150 transition-transform duration-300" />
                <div>
                  <h3 className="text-white font-semibold text-base sm:text-lg group-hover:text-primary-light transition-colors">{feature.title}</h3>
                  <p className="text-white/40 text-sm sm:text-base mt-2 sm:mt-3 leading-relaxed group-hover:text-white/60 transition-colors">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
