"use client";

import { useState, type FormEvent } from "react";
import type { FeedbackStars } from "../lib/types";

interface FeedbackSubmitPayload {
  stars: FeedbackStars;
  comment?: string;
}

interface VoiceFeedbackModalProps {
  creatorName: string;
  isSubmitting: boolean;
  submitError?: string | null;
  onSubmit: (payload: FeedbackSubmitPayload) => Promise<void>;
}

const STAR_COPY: Record<FeedbackStars, string> = {
  1: "Not great - we need to improve.",
  2: "Could be better.",
  3: "It was okay.",
  4: "Nice session.",
  5: "Excellent experience.",
};

export default function VoiceFeedbackModal({
  creatorName,
  isSubmitting,
  submitError,
  onSubmit,
}: VoiceFeedbackModalProps) {
  const [selectedStars, setSelectedStars] = useState<0 | FeedbackStars>(0);
  const [hoverStars, setHoverStars] = useState<0 | FeedbackStars>(0);
  const [comment, setComment] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const activeStars = hoverStars || selectedStars;
  const starsError = attemptedSubmit && selectedStars === 0;
  const selectedCopy =
    selectedStars === 0
      ? "Select a star rating to continue."
      : STAR_COPY[selectedStars];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttemptedSubmit(true);

    if (selectedStars === 0 || isSubmitting) {
      return;
    }

    const normalizedComment = comment.trim();

    await onSubmit({
      stars: selectedStars,
      comment: normalizedComment.length > 0 ? normalizedComment : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

      <div className="relative w-[92vw] max-w-[380px] sm:w-full sm:max-w-md animate-fade-in-up">
        <div
          className="relative bg-black/80 backdrop-blur-3xl border border-white/10 shadow-2xl px-6 sm:px-8 py-8 sm:py-10 overflow-hidden"
          style={{ borderRadius: "1.5rem" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-[30px] sm:text-[32px] md:text-[34px] font-black mb-2 text-white tracking-tight leading-tight">
              Session feedback.
            </h2>
            <p className="text-[14px] sm:text-[15px] text-[#A1A1A1] mb-6 font-medium leading-snug">
              Rate your experience with {creatorName}.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">Rating</label>
                <div role="radiogroup" aria-label="Rate your session" className="flex items-center gap-2.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const value = star as FeedbackStars;
                    const isActive = value <= activeStars;
                    const isSelected = value === selectedStars;

                    return (
                      <button
                        key={value}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`Rate ${value} star${value > 1 ? "s" : ""}`}
                        onClick={() => {
                          setSelectedStars(value);
                          setAttemptedSubmit(false);
                        }}
                        onMouseEnter={() => setHoverStars(value)}
                        onMouseLeave={() => setHoverStars(0)}
                        className="transition-transform duration-200 hover:scale-110"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          className={`h-8 w-8 ${
                            isActive
                              ? "fill-amber-300 text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.45)]"
                              : "fill-transparent text-white/25"
                          }`}
                        >
                          <path
                            stroke="currentColor"
                            strokeWidth="1.5"
                            d="m12 2.5 2.94 5.95 6.56.95-4.75 4.63 1.12 6.54L12 17.47 6.13 20.57l1.12-6.54L2.5 9.4l6.56-.95L12 2.5Z"
                          />
                        </svg>
                      </button>
                    );
                  })}
                </div>

                <p className="mt-2 text-xs text-white/50">{selectedCopy}</p>
                {starsError && (
                  <p className="mt-2 text-xs font-medium text-rose-300">Please select a star rating to continue.</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="voice-feedback-comment" className="block text-[11px] font-bold text-white/40 uppercase tracking-wider">
                    Comments
                  </label>
                  <span className="text-[11px] text-white/30">{comment.length}/1000</span>
                </div>

                <textarea
                  id="voice-feedback-comment"
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Tell us what worked well or what should improve."
                  rows={4}
                  maxLength={1000}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 text-sm font-medium outline-none focus:border-white/30 transition-colors resize-none"
                />
              </div>

              {submitError && (
                <p className="rounded-xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-100">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm transition-all duration-300 hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Submitting Feedback...
                  </span>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
