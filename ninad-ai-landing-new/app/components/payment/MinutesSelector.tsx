"use client";

import type { AllowedDurationMinutes } from "../../lib/types";

export interface MinutePlan {
  minutes: AllowedDurationMinutes;
  price: number;
  label: string;
  featured?: boolean;
}

interface MinutesSelectorProps {
  plans: MinutePlan[];
  selectedMinutes: AllowedDurationMinutes | null;
  onSelectMinutes: (minutes: AllowedDurationMinutes) => void;
  disabled?: boolean;
}

export default function MinutesSelector({
  plans,
  selectedMinutes,
  onSelectMinutes,
  disabled = false,
}: MinutesSelectorProps) {
  return (
    <div className="w-[86%] sm:w-full max-w-[280px] sm:max-w-[320px] self-center grid grid-cols-6 gap-x-2.5 gap-y-2.5 sm:gap-x-3 sm:gap-y-3">
      {plans.map((plan, index) => {
        const isSelected = selectedMinutes === plan.minutes;
        const isBottomRow = index >= 3;
        const featured = plan.featured;

        return (
          <button
            key={plan.minutes}
            onClick={() => onSelectMinutes(plan.minutes)}
            disabled={disabled}
            className={`relative ${isBottomRow ? "col-span-3" : "col-span-2"} h-[62px] sm:h-[68px] rounded-xl sm:rounded-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed ${
              featured
                ? "bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 p-[2px] shadow-[0_10px_30px_rgba(236,72,153,0.35)] hover:scale-[1.04] hover:shadow-[0_12px_36px_rgba(236,72,153,0.5)] active:scale-[1.01]"
                : `border flex flex-col items-center justify-center ${isSelected ? "border-white bg-white/10 text-white shadow-lg" : "border-white/20 bg-white/5 text-white/70 hover:border-white/50"}`
            } ${featured && isSelected ? "ring-2 ring-white/70 shadow-[0_12px_36px_rgba(236,72,153,0.55)]" : ""}`}
          >
            {featured ? (
              <>
                <span className="flex h-full w-full flex-col items-center justify-center rounded-[10px] sm:rounded-[14px] bg-[#0F0F13]">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold mb-0.5 text-pink-200">
                    {plan.label.toUpperCase()}
                  </span>
                  <span
                    className={`text-xs sm:text-sm font-bold leading-none ${
                      isSelected
                        ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-300 to-orange-300"
                        : "text-white"
                    }`}
                  >
                    ₹{plan.price}
                  </span>
                </span>
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 px-2 py-[2px] text-[8px] font-bold uppercase tracking-wider text-white shadow-[0_2px_10px_rgba(236,72,153,0.5)]">
                  Popular
                </span>
              </>
            ) : (
              <>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold mb-0.5">{plan.label.toUpperCase()}</span>
                <span className="text-xs sm:text-sm font-bold leading-none">₹{plan.price}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
