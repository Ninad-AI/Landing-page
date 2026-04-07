"use client";

import { useCallback } from "react";
import { loadRazorpayScript, type RazorpaySuccessResponse } from "../lib/razorpay";

interface OpenCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  orderId: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  themeColor?: string;
}

export function useRazorpay() {
  const openCheckout = useCallback(async (options: OpenCheckoutOptions): Promise<RazorpaySuccessResponse> => {
    const scriptLoaded = await loadRazorpayScript();
    const RazorpayConstructor = window.Razorpay;
    if (!scriptLoaded || !RazorpayConstructor) {
      throw new Error("Unable to load Razorpay checkout. Please try again.");
    }

    return new Promise<RazorpaySuccessResponse>((resolve, reject) => {
      const checkout = new RazorpayConstructor({
        key: options.key,
        amount: options.amount,
        currency: options.currency,
        order_id: options.orderId,
        name: options.name,
        description: options.description,
        prefill: options.prefill,
        theme: {
          color: options.themeColor || "#6125D8",
        },
        modal: {
          confirm_close: true,
          escape: true,
          animation: true,
          ondismiss: () => reject(new Error("Payment cancelled by user.")),
        },
        handler: (response: RazorpaySuccessResponse) => resolve(response),
      });

      checkout.open();
    });
  }, []);

  return { openCheckout };
}
