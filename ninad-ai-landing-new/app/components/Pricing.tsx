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
    >
      <circle 
        cx="10" 
        cy="10" 
        r="9" 
        fill={highlighted ? "white" : "#6125d8"} 
      />
      <path
        d="M6 10L9 13L14 7"
        stroke={highlighted ? "#6125d8" : "white"}
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
      className={`relative rounded-[26px] p-8 flex flex-col ${
        isHighlighted
          ? "bg-[#6125d8] shadow-[0px_32px_34px_0px_rgba(82,67,194,0.3)] min-h-[474px] w-[294px]"
          : "min-h-[420px] w-[232px]"
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute top-5 right-5 bg-black rounded-[13.5px] px-3 py-1">
          <span className="font-poppins font-extrabold text-[10px] text-white tracking-[0.83px]">
            {plan.badge}
          </span>
        </div>
      )}

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-2">
        <span
          className={`font-poppins font-bold text-[36px] leading-[46px] ${
            isHighlighted ? "text-white" : "text-white"
          }`}
        >
          {plan.price}
        </span>
        <span
          className={`font-poppins font-medium text-[14px] ${
            isHighlighted ? "text-white/80" : "text-white/60"
          }`}
        >
          {plan.period}
        </span>
      </div>

      {/* Plan Name */}
      <h3
        className={`font-poppins font-medium text-[28px] mb-6 ${
          isHighlighted ? "text-white" : "text-[#6125d8]"
        }`}
      >
        {plan.name}
      </h3>

      {/* Features */}
      <div className="space-y-3 flex-1">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <CheckIcon highlighted={isHighlighted} />
            </div>
            <span
              className={`font-poppins font-medium text-[13px] ${
                isHighlighted ? "text-white" : "text-white"
              }`}
            >
              {feature.text}
            </span>
          </div>
        ))}
      </div>

      {/* CTA Button */}
      <button
        className={`w-full h-[44px] rounded-[24px] font-poppins font-medium text-[15px] mt-8 ${
          isHighlighted
            ? "bg-white text-black"
            : "bg-[#6125d8] text-white"
        }`}
      >
        Choose plan
      </button>
    </div>
  );
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[644px] h-[448px] bg-[#6125d8] rounded-full blur-[200px] opacity-30 top-[200px] left-1/2 -translate-x-1/2" />

      {/* Content */}
      <div className="relative w-[min(1170px,calc(100vw-110px))] mx-auto">
        {/* Header with Title and Toggle */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          {/* Section Title */}
          <h2 className="font-inter font-extrabold text-[40px] md:text-[56px] lg:text-[62px] leading-none tracking-[-1.86px] text-white uppercase mb-6 md:mb-0">
            Plans & Pricing
          </h2>

          {/* Billing Toggle */}
          <div className="relative h-[42px] bg-[#1a1a2e] rounded-[22px] overflow-hidden flex">
            {/* Monthly Tab */}
            <button
              onClick={() => setIsYearly(false)}
              className={`relative h-[42px] px-6 py-3 rounded-[22px] flex items-center transition-all duration-300 ${
                !isYearly 
                  ? "bg-[#6125d8] shadow-[4px_0px_3px_0px_rgba(6,3,25,0.23)]" 
                  : ""
              }`}
            >
              <span className="font-poppins font-medium text-[12px] text-white tracking-[0.83px]">
                MONTHLY
              </span>
            </button>
            {/* Yearly Tab */}
            <button
              onClick={() => setIsYearly(true)}
              className={`relative h-[42px] px-6 py-3 rounded-[22px] flex items-center transition-all duration-300 ${
                isYearly 
                  ? "bg-[#6125d8] shadow-[4px_0px_3px_0px_rgba(6,3,25,0.23)]" 
                  : ""
              }`}
            >
              <span className="font-poppins font-medium text-[12px] text-white tracking-[0.83px]">
                YEARLY
              </span>
            </button>
          </div>
        </div>

        {/* Glass Container */}
        <div className="relative rounded-[30px] border border-[#4a4a4a] overflow-hidden">
          {/* Glass background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e]/80 to-[#0d0d1a]/90 backdrop-blur-sm rounded-[30px]" />
          
          {/* Bottom glow effect */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[200px] bg-[#6125d8] rounded-full blur-[100px] opacity-20" />

          {/* Pricing Cards */}
          <div className="relative flex flex-col lg:flex-row items-center lg:items-end justify-center gap-6 lg:gap-8 py-12 px-6">
            {plans.map((plan, index) => (
              <PricingCard key={index} plan={plan} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
