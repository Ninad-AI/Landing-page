"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { paymentApi } from "../../lib/api";
import { RAZORPAY_PUBLIC_KEY } from "../../lib/config";
import type { AllowedDurationMinutes } from "../../lib/types";
import { useRazorpay } from "../../hooks/useRazorpay";
import { useSlotAvailability } from "../../hooks/useSlotAvailability";
import { HEALTH_POLL_INTERVAL_SECONDS } from "../../lib/systemHealthStore";
import MinutesSelector, { type MinutePlan } from "./MinutesSelector";

const DEFAULT_PROVIDER_NAME = "deepgram";
const HIGH_TRAFFIC_MESSAGE = "The traffic is high right now. Please come back later.";
const HEALTH_RECHECK_SECONDS = HEALTH_POLL_INTERVAL_SECONDS;

const DURATION_PLANS: MinutePlan[] = [
  { minutes: 3, price: 59, label: "3 minutes" },
  { minutes: 5, price: 99, label: "5 minutes" },
  { minutes: 10, price: 189, label: "10 minutes" },
  { minutes: 15, price: 279, label: "15 minutes" },
  { minutes: 20, price: 379, label: "20 minutes" },
  { minutes: 30, price: 569, label: "30 minutes" },
];

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
}

export default function PaymentModal({
  isOpen,
  onClose,
  influencerId,
  userName,
  userEmail,
  providerName = DEFAULT_PROVIDER_NAME,
  onPaymentVerified,
}: PaymentModalProps) {
  const [selectedMinutes, setSelectedMinutes] = useState<AllowedDurationMinutes | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [bookingUnavailableMessage, setBookingUnavailableMessage] = useState<string | null>(null);

  const { openCheckout } = useRazorpay();
  const slots = useSlotAvailability(providerName);
  const isAwaitingInitialSlotCheck = !slots.isLoaded;

  /* Countdown to next health poll (visual only) */
  const [nextCheckIn, setNextCheckIn] = useState(HEALTH_RECHECK_SECONDS);
  const nextCheckTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isOpen || !slots.isFull) {
      setNextCheckIn(HEALTH_RECHECK_SECONDS);
      if (nextCheckTimerRef.current) clearInterval(nextCheckTimerRef.current);
      return;
    }

    // Reset countdown when a fresh health check completes
    setNextCheckIn(HEALTH_RECHECK_SECONDS);
    nextCheckTimerRef.current = setInterval(() => {
      setNextCheckIn((prev) => {
        if (prev <= 1) return HEALTH_RECHECK_SECONDS; // will be reset by next health poll
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (nextCheckTimerRef.current) clearInterval(nextCheckTimerRef.current);
    };
  }, [isOpen, slots.isFull, slots.isChecking]);

  const selectedDuration = selectedMinutes;

  const isBusy = isCreatingOrder || isVerifyingPayment;

  useEffect(() => {
    if (!isOpen) {
      setBookingUnavailableMessage(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (isBusy) return;
    setBookingUnavailableMessage(null);
    onClose();
  };

  const handlePayNow = async () => {
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

      if (verifyResult.success === false) {
        throw new Error(verifyResult.message || "Payment verification failed.");
      }

      toast.success(verifyResult.message || "Payment successful. Your booking is confirmed.");

      onPaymentVerified(selectedDuration, verifyResult.booking_id);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={handleClose} />
      <div className="relative w-[92vw] max-w-[360px] sm:w-full sm:max-w-md animate-fade-in-up">
        <div
          className="relative bg-black/80 backdrop-blur-3xl border border-white/10 shadow-2xl px-6 sm:px-8 p-6 sm:p-8 md:p-10 min-h-[400px] sm:min-h-[440px] flex flex-col justify-center overflow-hidden"
          style={{ borderRadius: "1.5rem" }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/20 blur-[80px] rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col h-full justify-center items-center">
            <div className="w-full max-w-[340px] flex flex-col justify-center">
              <div className="text-left w-full sm:w-[320px] mx-auto px-4 sm:px-6">
                <h3 className="text-[30px] sm:text-[32px] md:text-[34px] font-black mb-1.5 sm:mb-2 text-white tracking-tight leading-tight">
                  Duration.
                </h3>
                <p className="text-[14px] sm:text-[15px] md:text-[16px] text-[#A1A1A1] mb-8 sm:mb-9 font-medium leading-snug">
                  Select your preferred session length.
                </p>
              </div>

              <div className="w-full animate-fade-in-up flex flex-col items-center gap-4 sm:gap-5 mt-1 sm:mt-2">
                <MinutesSelector
                  plans={DURATION_PLANS}
                  selectedMinutes={selectedMinutes}
                  onSelectMinutes={(minutes) => {
                    setSelectedMinutes(minutes);
                    setBookingUnavailableMessage(null);
                  }}
                  disabled={isBusy}
                />

                {/* Slot availability banner */}
                {slots.isLoaded && slots.isFull && (
                  <div className="w-[86%] sm:w-[320px] rounded-xl border border-amber-200/25 bg-amber-500/10 px-4 py-3.5">
                    <div className="flex items-start gap-2.5">
                      <svg className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <p className="text-[13px] text-amber-100 font-semibold">All slots are currently full</p>
                        <p className="text-[11px] text-amber-200/70 mt-1 leading-relaxed">
                          {slots.activeSessions} of {slots.maxSlots} sessions active.
                          Please wait for a slot to free up.
                        </p>
                        <p className="text-[11px] text-amber-200/50 mt-1.5 font-mono">
                          {slots.isChecking ? 'Checking...' : `Rechecking in ${nextCheckIn}s`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {bookingUnavailableMessage && !slots.isFull && (
                  <div className="w-[86%] sm:w-[320px] rounded-xl border border-amber-200/30 bg-amber-500/10 px-4 py-3">
                    <p className="text-[12px] text-amber-100 font-medium">{bookingUnavailableMessage}</p>
                  </div>
                )}

                <div className="w-full flex justify-center pt-1 sm:pt-2">
                  <button
                    onClick={handlePayNow}
                    disabled={!selectedDuration || isBusy || slots.isFull || isAwaitingInitialSlotCheck}
                    className={`w-[86%] sm:w-[320px] h-[64px] rounded-2xl font-semibold text-lg transition-all duration-500 ${
                      slots.isFull
                        ? "bg-white/5 text-white/25 border border-white/8 cursor-not-allowed"
                        : selectedDuration
                          ? "bg-gradient-to-r from-pink-500 via-red-500 to-orange-500 text-white shadow-[0_10px_40px_rgba(255,80,80,0.35)] hover:scale-[1.02]"
                          : "bg-white/10 text-white/30 border border-white/10"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
