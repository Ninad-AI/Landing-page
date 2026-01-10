"use client";

import { useEffect, useMemo, useState } from "react";

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
      form.email.trim().length > 3 &&
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
      const res = await fetch("/api/book-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company,
          message: form.message,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok: true; message?: string }
        | { ok: false; error?: string }
        | null;

      if (!res.ok || !data || !("ok" in data) || data.ok === false) {
        throw new Error(data && "error" in data && data.error ? data.error : "Failed to submit.");
      }

      setStatus({
        type: "success",
        message: data.message || "Request received — we’ll reach out shortly.",
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
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-2">
            <span className="text-white/70 text-sm font-inter">Name *</span>
            <input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              className="w-full h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white placeholder:text-white/30 outline-none focus:border-white/25"
              placeholder="Your name"
              autoComplete="name"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-white/70 text-sm font-inter">Email *</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange("email", e.target.value)}
              className="w-full h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white placeholder:text-white/30 outline-none focus:border-white/25"
              placeholder="you@company.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="space-y-2">
            <span className="text-white/70 text-sm font-inter">Company</span>
            <input
              value={form.company}
              onChange={(e) => onChange("company", e.target.value)}
              className="w-full h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white placeholder:text-white/30 outline-none focus:border-white/25"
              placeholder="Company name"
              autoComplete="organization"
            />
          </label>

          <label className="space-y-2">
            <span className="text-white/70 text-sm font-inter">Phone</span>
            <input
              value={form.phone}
              onChange={(e) => onChange("phone", e.target.value)}
              className="w-full h-12 rounded-2xl bg-black/30 border border-white/10 px-4 text-white placeholder:text-white/30 outline-none focus:border-white/25"
              placeholder="e.g. +91 99999 99999"
              autoComplete="tel"
              required
            />
          </label>
        </div>

        <label className="space-y-2 block">
          <span className="text-white/70 text-sm font-inter">What are you building?</span>
          <textarea
            value={form.message}
            onChange={(e) => onChange("message", e.target.value)}
            className="w-full min-h-28 rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-white/25 resize-y"
            placeholder="Tell us about your product, volume, latency requirements, etc."
          />
        </label>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit || status.type === "loading"}
            className="inline-flex items-center justify-center h-12 px-6 rounded-full bg-white text-black font-sans font-bold text-sm hover:bg-gray-200 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status.type === "loading" ? "Sending…" : "Request demo"}
          </button>

          {status.type === "success" ? (
            <p className="text-sm text-emerald-300/90 font-inter">{status.message}</p>
          ) : null}
          {status.type === "error" ? (
            <p className="text-sm text-red-300/90 font-inter">{status.message}</p>
          ) : null}

          {status.type === "idle" ? (
            <p className="text-sm text-white/45 font-inter">
              We’ll respond within 1–2 business days.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}
