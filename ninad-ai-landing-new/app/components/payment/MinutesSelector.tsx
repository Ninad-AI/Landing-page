"use client";

import type { AllowedDurationMinutes } from "../../lib/types";

export interface MinutePlan {
  minutes: AllowedDurationMinutes;
  price: number;
  label: string;
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
      {plans.map((plan) => {
        const isSelected = selectedMinutes === plan.minutes;

        return (
          <button
            key={plan.minutes}
            onClick={() => onSelectMinutes(plan.minutes)}
            disabled={disabled}
            className={`col-span-2 h-[62px] sm:h-[68px] rounded-xl sm:rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center ${isSelected ? "border-white bg-white/10 text-white shadow-lg" : "border-white/20 bg-white/5 text-white/70 hover:border-white/50"} disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold mb-0.5">{plan.label.toUpperCase()}</span>
            <span className="text-xs sm:text-sm font-bold leading-none">₹{plan.price}</span>
          </button>
        );
      })}
    </div>
  );
}
