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
    <div className="w-full grid grid-cols-6 gap-x-2.5 gap-y-2.5 sm:gap-x-3 sm:gap-y-3">
      {plans.map((plan, index) => {
        const isSelected = selectedMinutes === plan.minutes;
        const isBottomRow = index >= 3;
        const featured = plan.featured;

        return (
          <button
            key={plan.minutes}
            onClick={() => onSelectMinutes(plan.minutes)}
            disabled={disabled}
            className={`relative ${isBottomRow ? "col-span-3" : "col-span-2"} h-[62px] sm:h-[68px] rounded-xl sm:rounded-2xl transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${
              featured
                ? "bg-gradient-to-br from-nd-accent to-nd-accent-dark p-[2px] hover:scale-[1.03]"
                : `border flex flex-col items-center justify-center ${isSelected ? "border-nd-ink bg-nd-tint text-nd-ink" : "border-nd-line bg-white text-nd-muted hover:border-nd-ink/50"}`
            } ${featured && isSelected ? "ring-2 ring-nd-accent/50" : ""}`}
          >
            {featured ? (
              <>
                <span className="flex h-full w-full flex-col items-center justify-center rounded-[10px] sm:rounded-[14px] bg-nd-bg">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-bold mb-0.5 text-nd-accent">
                    {plan.label.toUpperCase()}
                  </span>
                  <span className="text-xs sm:text-sm font-bold leading-none text-nd-ink">
                    ₹{plan.price}
                  </span>
                </span>
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-nd-accent to-nd-accent-dark px-2 py-[2px] text-[8px] font-bold uppercase tracking-wider text-white">
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
