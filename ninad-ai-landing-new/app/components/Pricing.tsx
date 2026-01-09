"use client";

import { useState } from "react";

// Check icon component
function CheckIcon({ highlighted = false }: { highlighted?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <circle 
        cx="10" 
        cy="10" 
        r="9" 
        className={highlighted ? "fill-white" : "fill-primary"}
      />
      <path
        d="M6 10L9 13L14 7"
        className={highlighted ? "stroke-primary" : "stroke-white"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface PlanFeature {
  text: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  features: PlanFeature[];
  highlighted?: boolean;
  badge?: string;
}

const plans: PricingPlan[] = [
  {
    name: "Free Trial",
    price: "$0",
    period: "/14 day",
    features: [
      { text: "Unlimited users" },
      { text: "All integrations and APIs" },
      { text: "SOC2 + GDPR compliance" },
    ],
  },
  {
    name: "Professional",
    price: "$8",
    period: "/month billed annually",
    features: [
      { text: "Unlimited users" },
      { text: "All integrations and APIs" },
      { text: "SOC2 + GDPR compliance" },
      { text: "Unlimited threads & chats" },
    ],
  },
  {
    name: "Organization",
    price: "$14",
    period: "/month billed annually",
    highlighted: true,
    badge: "MOST POPULAR",
    features: [
      { text: "Unlimited users" },
      { text: "All integrations and APIs" },
      { text: "SOC2 + GDPR compliance" },
      { text: "Unlimited threads & chats" },
      { text: "Advanced invitation controls" },
      { text: "SCIM & SSO" },
    ],
  },
];

function PricingCard({ plan }: { plan: PricingPlan }) {
  const isHighlighted = plan.highlighted;

  return (
    <div
      className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2
        ${
          isHighlighted
            ? "bg-primary shadow-[0_20px_40px_-10px_rgba(97,37,216,0.4)] border border-primary z-10 lg:scale-105"
            : "bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:bg-white/10"
        }
      `}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md rounded-full px-3 py-1 border border-white/10 shadow-lg">
          <span className="font-sans font-bold text-[10px] text-white tracking-widest uppercase">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-2">
        <span className="font-sans font-bold text-4xl text-white">
          {plan.price}
        </span>
        <span
          className={`font-sans text-sm ${
            isHighlighted ? "text-white/80" : "text-muted"
          }`}
        >
          {plan.period}
        </span>
      </div>

      {/* Plan Name */}
      <h3
        className={`font-sans font-bold text-xl mb-6 ${
          isHighlighted ? "text-white" : "text-primary"
        }`}
      >
        {plan.name}
      </h3>

      {/* Features */}
      <div className="space-y-4 mb-8 flex-1">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className="mt-0.5">
              <CheckIcon highlighted={isHighlighted} />
            </div>
            <span
              className={`font-roboto text-sm leading-relaxed ${
                isHighlighted ? "text-white/95" : "text-gray-300"
              }`}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        className={`w-full py-3.5 rounded-xl font-sans font-bold text-sm transition-colors duration-300 shadow-lg
          ${
            isHighlighted
              ? "bg-white text-primary hover:bg-gray-100"
              : "bg-primary text-white hover:bg-primary-dark"
          }
        `}
      >
        Choose plan
      </button>
    </div>
  );
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="relative py-24 md:py-32 bg-black flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Content */}
      <div className="relative container mx-auto px-6 max-w-7xl z-10 w-full flex flex-col items-center">
        {/* Section Title */}
        <div className="text-center mb-16 w-full">
            <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-7xl text-white mb-8 tracking-tight">
            Plans & Pricing
            </h2>
            
            {/* Billing Toggle */}
            <div className="flex justify-center">
                <div className="inline-flex items-center p-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                    <button
                    onClick={() => setIsYearly(false)}
                    className={`px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 ${
                        !isYearly 
                        ? "bg-primary text-white shadow-lg" 
                        : "text-white/60 hover:text-white"
                    }`}
                    >
                    MONTHLY
                    </button>
                    <button
                    onClick={() => setIsYearly(true)}
                    className={`px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
                        isYearly 
                        ? "bg-primary text-white shadow-lg" 
                        : "text-white/60 hover:text-white"
                    }`}
                    >
                    ANNUAL
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isYearly ? 'bg-white/20' : 'bg-primary/20 text-primary'}`}>
                        -20%
                    </span>
                    </button>
                </div>
            </div>
        </div>

        {/* Pricing Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl items-start">
          {/* Free Trial */}
          <PricingCard plan={plans[0]} />

          {/* Professional */}
          <PricingCard plan={plans[1]} />

          {/* Organization (Highlighted) */}
          <PricingCard plan={plans[2]} />
        </div>
      </div>
    </section>
  );
}
