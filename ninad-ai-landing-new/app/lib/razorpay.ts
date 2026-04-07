export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    confirm_close?: boolean;
    escape?: boolean;
    animation?: boolean;
  };
  handler: (response: RazorpaySuccessResponse) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => { open: () => void };
  }
}

const RAZORPAY_SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export async function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false;
  }

  if (window.Razorpay) {
    return true;
  }

  const alreadyInjected = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
  if (alreadyInjected) {
    return new Promise((resolve) => {
      alreadyInjected.addEventListener('load', () => resolve(true), { once: true });
      alreadyInjected.addEventListener('error', () => resolve(false), { once: true });
    });
  }

  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
