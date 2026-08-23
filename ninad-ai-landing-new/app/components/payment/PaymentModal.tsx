"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { paymentApi } from "../../lib/api";
import { RAZORPAY_PUBLIC_KEY } from "../../lib/config";
import type { AllowedDurationMinutes, FeedbackStars } from "../../lib/types";
import { useRazorpay } from "../../hooks/useRazorpay";
import { useSlotAvailability } from "../../hooks/useSlotAvailability";
import { HEALTH_POLL_INTERVAL_SECONDS } from "../../lib/systemHealthStore";
import NdModal from "../ui/NdModal";
import MinutesSelector, { type MinutePlan } from "./MinutesSelector";

const DEFAULT_PROVIDER_NAME = "deepgram";
const HIGH_TRAFFIC_MESSAGE = "The traffic is high right now. Please come back later.";
const HEALTH_RECHECK_SECONDS = HEALTH_POLL_INTERVAL_SECONDS;

const DURATION_PLANS: MinutePlan[] = [
  { minutes: 1, price: 19, label: "1 minute", featured: true },
  { minutes: 3, price: 59, label: "3 minutes" },
  { minutes: 5, price: 99, label: "5 minutes" },
  { minutes: 10, price: 189, label: "10 minutes" },
  { minutes: 15, price: 279, label: "15 minutes" },
];

const STAR_COPY: Record<FeedbackStars, string> = {
  1: "Not great - we need to improve.",
  2: "Could be better.",
  3: "It was okay.",
  4: "Nice session.",
  5: "Excellent experience.",
};

function getPaymentErrorDetails(error: unknown): { message: string; status?: number } {
  const apiError = error as {
    response?: {
      status?: number;
      data?: {
        detail?: string;
        message?: string;
        error?: string;
      };
    };
    message?: string;
  };

  const message =
    apiError.response?.data?.detail ||
    apiError.response?.data?.message ||
    apiError.response?.data?.error ||
    (error instanceof Error ? error.message : "Unable to complete payment flow.");

  return {
    message,
    status: apiError.response?.status,
  };
}

function isHighTrafficOrFullSlotsError(message: string, status?: number): boolean {
  if (status === 409 || status === 429 || status === 503) {
    return true;
  }

  const normalized = message.toLowerCase();
  return (
    normalized.includes("all slots") ||
    normalized.includes("slot") ||
    normalized.includes("fully booked") ||
    normalized.includes("no slot") ||
    normalized.includes("capacity") ||
    normalized.includes("traffic") ||
    normalized.includes("too many requests") ||
    normalized.includes("come back later")
  );
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencerId: string;
  userName?: string;
  userEmail?: string;
  providerName?: string;
  onPaymentVerified: (duration: AllowedDurationMinutes, bookingId?: string) => void;
  onRequireAuth?: (duration: AllowedDurationMinutes) => void;
  autoStartDuration?: AllowedDurationMinutes | null;
  onAutoStartConsumed?: () => void;
  onSelectPaidPlan?: (duration: AllowedDurationMinutes) => void;
  feedbackMode?: boolean;
  onSubmitFeedback?: (stars: FeedbackStars, comment?: string) => Promise<void>;
  isSubmittingFeedback?: boolean;
  feedbackError?: string | null;
  creatorName?: string;
}

export default function PaymentModal({
  isOpen,
  onClose,
  influencerId,
  userName,
  userEmail,
  providerName = DEFAULT_PROVIDER_NAME,
  onPaymentVerified,
  onRequireAuth,
  autoStartDuration,
  onAutoStartConsumed,
  onSelectPaidPlan,
  feedbackMode = false,
  onSubmitFeedback,
  isSubmittingFeedback = false,
  feedbackError,
  creatorName = "the creator",
}: PaymentModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<AllowedDurationMinutes | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [bookingUnavailableMessage, setBookingUnavailableMessage] = useState<string | null>(null);
  const autoStartKeyRef = useRef<string | null>(null);

  const [selectedStars, setSelectedStars] = useState<0 | FeedbackStars>(0);
  const [hoverStars, setHoverStars] = useState<0 | FeedbackStars>(0);
  const [comment, setComment] = useState("");
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  const { openCheckout } = useRazorpay();
  const slots = useSlotAvailability(providerName);
  const isAwaitingInitialSlotCheck = !slots.isLoaded;

  const [nextCheckIn, setNextCheckIn] = useState(HEALTH_RECHECK_SECONDS);
  const nextCheckTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen || !slots.isFull) {
      setNextCheckIn(HEALTH_RECHECK_SECONDS);
      if (nextCheckTimerRef.current) clearInterval(nextCheckTimerRef.current);
      return;
    }

    setNextCheckIn(HEALTH_RECHECK_SECONDS);
    nextCheckTimerRef.current = setInterval(() => {
      setNextCheckIn((prev) => {
        if (prev <= 1) return HEALTH_RECHECK_SECONDS;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (nextCheckTimerRef.current) clearInterval(nextCheckTimerRef.current);
    };
  }, [isOpen, slots.isFull, slots.isChecking]);

  useEffect(() => {
    if (!isOpen) {
      setBookingUnavailableMessage(null);
      setSelectedStars(0);
      setHoverStars(0);
      setComment("");
      setAttemptedSubmit(false);
    }
  }, [isOpen]);

  const selectedDuration = selectedMinutes;

  const isBusy = isCreatingOrder || isVerifyingPayment;

  const handleClose = () => {
    if (isBusy) return;
    setBookingUnavailableMessage(null);
    onClose();
  };

  const handlePayNow = async (durationOverride?: AllowedDurationMinutes | null) => {
    const selectedDuration = durationOverride ?? selectedMinutes;
    if (!selectedDuration) {
      toast.error("Please select a duration.");
      return;
    }

    if (!slots.isLoaded || slots.isChecking) {
      toast.info("Checking slot availability. Please wait a moment.");
      return;
    }

    if (slots.isFull) {
      setBookingUnavailableMessage(HIGH_TRAFFIC_MESSAGE);
      toast.error(HIGH_TRAFFIC_MESSAGE);
      return;
    }

    if (!influencerId?.trim()) {
      toast.error("Influencer context is missing. Please retry from creator page.");
      return;
    }

    if (onRequireAuth) {
      onRequireAuth(selectedDuration);
      return;
    }

    if (onSelectPaidPlan) {
      onSelectPaidPlan(selectedDuration);
      return;
    }

    setIsCreatingOrder(true);
    setBookingUnavailableMessage(null);

    try {
      const order = await paymentApi.createRazorpayOrder({
        duration_minutes: selectedDuration,
        influencer_id: influencerId,
        provider_name: providerName,
      });

      const checkoutKey = order.key_id || RAZORPAY_PUBLIC_KEY;
      if (!checkoutKey) {
        throw new Error("Missing Razorpay key. Backend must return key_id.");
      }

      const checkoutResult = await openCheckout({
        key: checkoutKey,
        amount: order.amount,
        currency: order.currency,
        orderId: order.order_id,
        name: "Ninad AI",
        description: `Payment for ${selectedDuration} minutes`,
        prefill: {
          name: userName,
          email: userEmail,
        },
        themeColor: "#6125D8",
      });

      setIsCreatingOrder(false);
      setIsVerifyingPayment(true);

      const verifyResult = await paymentApi.verifyRazorpayPayment({
        razorpay_order_id: checkoutResult.razorpay_order_id,
        razorpay_payment_id: checkoutResult.razorpay_payment_id,
        razorpay_signature: checkoutResult.razorpay_signature,
      });

      // Backend returns { status: "success", message, booking_id }
      const isSuccess = verifyResult.status === 'success' || verifyResult.success !== false;
      if (!isSuccess) {
        throw new Error(verifyResult.message || "Payment verification failed.");
      }

      toast.success(verifyResult.message || "Payment successful. Your booking is confirmed.");

      onPaymentVerified(selectedDuration, verifyResult.booking_id != null ? String(verifyResult.booking_id) : undefined);
      onClose();

      setSelectedMinutes(null);
    } catch (error) {
      const { message, status } = getPaymentErrorDetails(error);

      if (message.toLowerCase().includes("cancelled")) {
        toast.info("Payment was cancelled. You can retry.");
      } else if (isHighTrafficOrFullSlotsError(message, status)) {
        setBookingUnavailableMessage(HIGH_TRAFFIC_MESSAGE);
        toast.error(HIGH_TRAFFIC_MESSAGE);
      } else {
        toast.error(message);
      }
    } finally {
      setIsCreatingOrder(false);
      setIsVerifyingPayment(false);
    }
  };

  useEffect(() => {
    const key = autoStartDuration ? `${isOpen}:${autoStartDuration}` : null;
    if (!isOpen || !autoStartDuration || !key) {
      autoStartKeyRef.current = null;
      return;
    }
    if (autoStartKeyRef.current === key) return;
    if (!slots.isLoaded || slots.isChecking) return;
    autoStartKeyRef.current = key;
    setSelectedMinutes(autoStartDuration);
    setBookingUnavailableMessage(null);
    void handlePayNow(autoStartDuration);
    onAutoStartConsumed?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handlePayNow identity changes every render; autoStartKeyRef guard prevents double invocation.
  }, [isOpen, autoStartDuration, slots.isLoaded, slots.isChecking, onAutoStartConsumed]);

  const handleFeedbackSubmit = async () => {
    setAttemptedSubmit(true);
    if (selectedStars === 0 || isSubmittingFeedback || !onSubmitFeedback) return;
    const normalizedComment = comment.trim();
    await onSubmitFeedback(selectedStars, normalizedComment.length > 0 ? normalizedComment : undefined);
  };

  if (!isOpen) return null;

  const activeStars = hoverStars || selectedStars;

  return (
    <NdModal onClose={handleClose} maxWidth={400}>
      <div className="min-h-[380px] sm:min-h-[420px] flex flex-col justify-center">
        <div className="w-full max-w-[340px] mx-auto flex flex-col justify-center">
          {feedbackMode ? (
            <div className="w-full">
              <h3 className="font-display text-[32px] sm:text-[34px] mb-1.5 text-nd-ink tracking-tight leading-tight">
                Session feedback.
              </h3>
              <p className="text-[14px] sm:text-[15px] text-nd-dim mb-7 font-medium leading-snug">
                Rate your experience with {creatorName}.
              </p>

              <div className="w-full flex flex-col items-center gap-4 sm:gap-5">
                <div className="w-full">
                  <label className="block text-[11px] font-bold text-nd-dim uppercase tracking-wider mb-2">Rating</label>
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
                          className="transition-transform duration-200 hover:scale-110 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            className={`h-8 w-8 ${
                              isActive ? "fill-amber-400 text-amber-400" : "fill-transparent text-nd-line"
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
                  <p className="mt-2 text-xs text-nd-dim">
                    {selectedStars === 0 ? "Select a star rating to continue." : STAR_COPY[selectedStars]}
                  </p>
                  {attemptedSubmit && selectedStars === 0 && (
                    <p className="mt-2 text-xs font-medium text-red-600">Please select a star rating to continue.</p>
                  )}
                </div>

                <div className="w-full">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-nd-dim uppercase tracking-wider">Comments</label>
                    <span className="text-[11px] text-nd-dim">{comment.length}/1000</span>
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Tell us what worked well or what should improve."
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-3 rounded-xl bg-nd-panel border border-nd-line text-nd-ink placeholder-nd-dim text-sm font-medium outline-none focus:border-nd-accent transition-colors resize-none"
                  />
                </div>

                {feedbackError && (
                  <div className="w-full rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                    <p className="text-xs font-medium text-red-700">{feedbackError}</p>
                  </div>
                )}

                <div className="w-full flex justify-center pt-1">
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={isSubmittingFeedback}
                    className="w-full h-[58px] rounded-2xl font-bold text-[15px] bg-nd-ink text-nd-bg transition-all duration-300 hover:bg-[#302C36] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmittingFeedback ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting Feedback...
                      </span>
                    ) : (
                      "Submit Feedback"
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="text-left w-full mb-7">
                <h3 className="font-display text-[32px] sm:text-[34px] mb-1.5 text-nd-ink tracking-tight leading-tight">
                  Duration.
                </h3>
                <p className="text-[14px] sm:text-[15px] text-nd-dim font-medium leading-snug">
                  Select your preferred session length.
                </p>
              </div>

              <div className="w-full flex flex-col items-center gap-4 sm:gap-5">
                <MinutesSelector
                  plans={DURATION_PLANS}
                  selectedMinutes={selectedMinutes}
                  onSelectMinutes={(minutes) => {
                    setSelectedMinutes(minutes);
                    setBookingUnavailableMessage(null);
                  }}
                  disabled={isBusy}
                />

                {slots.isLoaded && slots.isFull && (
                  <div className="w-full rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3.5">
                    <div className="flex items-start gap-2.5">
                      <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <p className="text-[13px] text-amber-800 font-semibold">All slots are currently full</p>
                        <p className="text-[11px] text-amber-700/80 mt-1 leading-relaxed">
                          {slots.activeSessions} of {slots.maxSlots} sessions active.
                          Please wait for a slot to free up.
                        </p>
                        <p className="text-[11px] text-amber-700/60 mt-1.5 font-mono">
                          {slots.isChecking ? 'Checking...' : `Rechecking in ${nextCheckIn}s`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {bookingUnavailableMessage && !slots.isFull && (
                  <div className="w-full rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3">
                    <p className="text-[12px] text-amber-800 font-medium">{bookingUnavailableMessage}</p>
                  </div>
                )}

                <div className="w-full flex justify-center pt-1">
                  <button
                    onClick={() => void handlePayNow()}
                    disabled={!selectedDuration || isBusy || slots.isFull || isAwaitingInitialSlotCheck}
                    className={`w-full h-[58px] rounded-2xl font-bold text-[15px] transition-all duration-300 cursor-pointer ${
                      slots.isFull
                        ? "bg-nd-panel text-nd-dim border border-nd-line cursor-not-allowed"
                        : selectedDuration
                          ? "bg-nd-ink text-nd-bg hover:bg-[#302C36]"
                          : "bg-nd-panel text-nd-dim border border-nd-line"
                    } disabled:cursor-not-allowed disabled:opacity-70`}
                  >
                    {isVerifyingPayment
                      ? "Verifying Payment..."
                      : isCreatingOrder
                        ? "Opening Checkout..."
                        : isAwaitingInitialSlotCheck
                          ? "Checking Slots..."
                        : slots.isFull
                          ? "Waiting for Slots..."
                          : "Pay Now"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </NdModal>
  );
}
