"use client";

import React from "react";

const FEATURES = [
  {
    title: "Nothing goes live without your approval",
    desc: "Ensure that every content and transaction is approved by you before it goes live on the platform.",
  },
  {
    title: "Edit, pause, or turn it off anytime",
    desc: "You have the power to edit, pause, or deactivate any content or transaction at your convenience.",
  },
  {
    title: "No upfront cost or investment",
    desc: "We do not require any upfront costs or investments; you can start using the platform freely.",
  },
  {
    title: "Payments go to you automatically",
    desc: "Receive payments directly and securely, while we take a small cut for maintaining the platform.",
  }
];

export default function ControlAndSafety() {
  return (
    <section className="relative py-20 md:py-32 px-6 overflow-hidden">
      <div className="container mx-auto max-w-[1400px]">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="font-roboto font-semibold text-4xl md:text-[64px] text-white mb-4">
            Control & Safety
          </h2>
          <p className="font-roboto font-medium text-xl md:text-2xl text-[#c3c3c3]">
            You're always in control
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {FEATURES.map((feature, index) => (
            <div 
              key={index} 
              className="relative min-h-[140px] md:min-h-[162px] flex items-start p-6 md:p-8 group bg-gradient-to-r from-[#1a1a2e]/60 to-[#0d0d1a]/60 border border-white/10 rounded-xl transition-all duration-300 hover:border-primary/40 hover:bg-[#1a1a2e]/80"
            >
              {/* Checkmark Icon */}
              <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-primary/20 rounded-lg flex items-center justify-center mr-4 md:mr-6">
                <svg className="w-5 h-5 md:w-6 md:h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <div className="flex flex-col justify-center space-y-2">
                <h3 className="font-roboto font-normal text-xl md:text-2xl text-white">
                  {feature.title}
                </h3>
                <p className="font-roboto font-light text-sm md:text-base text-[#c3c3c3] max-w-[480px]">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
