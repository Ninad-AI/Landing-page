"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "../lib/supabaseClient";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
};

export default function BookDemoForm() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "loading" }
    | { type: "success"; message: string }
    | { type: "error"; message: string }
  >({ type: "idle" });

  useEffect(() => {
    if (status.type !== "success") return;
    const t = window.setTimeout(() => setStatus({ type: "idle" }), 4500);
    return () => window.clearTimeout(t);
  }, [status.type]);

  const canSubmit = useMemo(() => {
    return (
      isValidEmail(form.email.trim()) &&
      form.name.trim().length > 1 &&
      form.phone.trim().length > 3
    );
  }, [form.email, form.name, form.phone]);

  const onChange = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || status.type === "loading") return;

    setStatus({ type: "loading" });

    try {
      const name = form.name.trim().slice(0, 120);
      const email = form.email.trim().toLowerCase();
      const phone = form.phone.trim().slice(0, 40);
      const company = form.company.trim().slice(0, 160);
      const message = form.message.trim().slice(0, 2000);

      if (!name) {
        throw new Error("Please enter your name.");
      }

      if (!email || !isValidEmail(email)) {
        throw new Error("Please enter a valid email.");
      }

      if (!phone) {
        throw new Error("Please enter a phone number.");
      }

      const supabase = getSupabaseClient();
      const { error } = await supabase.from("demo_requests").insert({
        name,
        email,
        phone,
        company: company || null,
        message: message || null,
      });

      if (error) {
        if (typeof error.message === "string" && error.message.toLowerCase().includes("message")) {
          const retry = await supabase.from("demo_requests").insert({
            name,
            email,
            phone,
            company: company || null,
          });
          if (!retry.error) {
            setStatus({
              type: "success",
              message: "Thanks — we’ll email you to schedule a demo.",
            });
            setForm({ name: "", email: "", phone: "", company: "", message: "" });
            return;
          }
        }
        throw new Error(error.message);
      }

      setStatus({
        type: "success",
        message: "Thanks — we’ll email you to schedule a demo.",
      });
      setForm({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  return (
    <div className="rounded-3xl border border-nd-line bg-white p-6 md:p-8 shadow-[0_20px_60px_-20px_rgba(28,26,31,.15)]">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-nd-muted text-sm font-nd-sans">Name *</span>
            <input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="w-full h-12 rounded-2xl bg-nd-panel border border-nd-line px-4 text-nd-ink placeholder:text-nd-dim outline-none focus:border-nd-accent"
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-nd-muted text-sm font-nd-sans">Email *</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full h-12 rounded-2xl bg-nd-panel border border-nd-line px-4 text-nd-ink placeholder:text-nd-dim outline-none focus:border-nd-accent"
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-nd-muted text-sm font-nd-sans">Company</span>
            <input
              value={form.company}
              onChange={(e) => onChange("company", e.target.value)}
              className="w-full h-12 rounded-2xl bg-nd-panel border border-nd-line px-4 text-nd-ink placeholder:text-nd-dim outline-none focus:border-nd-accent"
              placeholder="Company name"
              autoComplete="organization"
            />
          </label>

          <label className="space-y-2">
            <span className="text-nd-muted text-sm font-nd-sans">Phone</span>
            <input
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className="w-full h-12 rounded-2xl bg-nd-panel border border-nd-line px-4 text-nd-ink placeholder:text-nd-dim outline-none focus:border-nd-accent"
              placeholder="e.g. +91 99999 99999"
              autoComplete="tel"
              required
            />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-nd-muted text-sm font-nd-sans">What are you building?</span>
          <textarea
            value={form.message}
            onChange={(e) => onChange("message", e.target.value)}
            className="w-full min-h-28 rounded-2xl bg-nd-panel border border-nd-line px-4 py-3 text-nd-ink placeholder:text-nd-dim outline-none focus:border-nd-accent resize-y"
            placeholder="Tell us about your product, volume, latency requirements, etc."
          />
        </label>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || status.type === "loading"}
            className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-nd-ink text-nd-bg font-nd-sans font-bold text-sm hover:bg-[#302C36] transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {status.type === "loading" ? "Sending…" : "Request demo"}
          </button>

          {status.type === "success" ? (
            <p className="text-sm text-emerald-600 font-nd-sans">{status.message}</p>
          ) : null}
          {status.type === "error" ? (
            <p className="text-sm text-red-600 font-nd-sans">{status.message}</p>
          ) : null}

          {status.type === "idle" ? (
            <p className="text-sm text-nd-dim font-nd-sans">
              We’ll respond within 1–2 business days.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
