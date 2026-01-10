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
  const sizeClass = isHighlighted ? "lg:z-10" : "lg:z-0";

  return (
    <div
      className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-2 transform-gpu origin-bottom lg:min-h-[540px] ${sizeClass}
        ${
          isHighlighted
            ? "bg-primary shadow-[0_20px_40px_-10px_rgba(97,37,216,0.4)] border border-primary"
            : "bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 hover:bg-white/10"
        }
      `}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-4 right-8 inline-flex items-center justify-center bg-black/50 backdrop-blur-md rounded-full px-3 py-1 border border-white/10 shadow-lg">
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

  const displayedPlans: PricingPlan[] = plans.map((plan) => {
    if (plan.name === "Free Trial") return plan;

    const numeric = Number(plan.price.replace("$", ""));
    if (!Number.isFinite(numeric)) return plan;

    if (isYearly) {
      return {
        ...plan,
        price: `$${numeric}`,
        period: "/month billed annually",
      };
    }

    const nonDiscountedMonthly = Math.ceil(numeric / 0.8);
    return {
      ...plan,
      price: `$${nonDiscountedMonthly}`,
      period: "/month",
    };
  });

  return (
    <section id="pricing" className="relative py-24 md:py-32 bg-black flex items-center justify-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Content */}
      <div className="relative container mx-auto px-6 max-w-7xl z-10 w-full">
        {/* Main wrapper */}
        <div className="w-full max-w-6xl mx-auto">
          {/* Header: title left, toggle right */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10">
            <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-7xl tracking-tight leading-tight pb-1 bg-gradient-to-b from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent">
              Plans & Pricing
            </h2>

            {/* Billing Toggle */}
            <div className="flex sm:justify-end">
              <div className="relative inline-grid grid-cols-2 items-center p-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
                <div
                  aria-hidden
                  className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary shadow-lg transition-transform duration-300 ease-out will-change-transform ${
                    isYearly ? "translate-x-full" : "translate-x-0"
                  }`}
                />

                <button
                  onClick={() => setIsYearly(false)}
                  className={`relative z-10 px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-colors duration-300 ${
                    !isYearly ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  MONTHLY
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`relative z-10 px-6 py-2 rounded-full text-xs md:text-sm font-bold transition-colors duration-300 flex items-center justify-center gap-2 ${
                    isYearly ? "text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  ANNUAL
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded transition-colors duration-300 ${
                      isYearly ? "bg-white/20" : "bg-primary/20 text-primary"
                    }`}
                  >
                    -20%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards Panel */}
          <div
            data-node-id="248:751"
            className="relative w-full rounded-[32px] bg-transparent backdrop-blur-xl border border-white/15 shadow-[0_30px_120px_rgba(0,0,0,0.65)] overflow-visible p-6 md:p-10"
          >
            {/* Subtle inner ring */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-white/10"
            />

            <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 lg:gap-4 w-full items-end">
              <PricingCard plan={displayedPlans[0]} />
              <PricingCard plan={displayedPlans[1]} />
              <PricingCard plan={displayedPlans[2]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
