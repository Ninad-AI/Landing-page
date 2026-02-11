"use client";

import { useEffect, useMemo, useState } from "react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
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

  const canSubmit = useMemo(() => email.trim().length > 3, [email]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || status.type === "loading") return;

    setStatus({ type: "loading" });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "homepage-waitlist" }),
      });

      const data = (await res.json().catch(() => null)) as
        | { ok: true; message?: string }
        | { ok: false; error?: string }
        | null;

      if (!res.ok || !data || !("ok" in data) || data.ok === false) {
        throw new Error(data && "error" in data && data.error ? data.error : "Failed to join waitlist.");
      }

      setStatus({
        type: "success",
        message: data.message || "You’re on the waitlist.",
      });
      setEmail("");
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Something went wrong.",
      });
    }
  };

  return (
    <section
      id="waitlist"
      className="relative w-full py-8 md:py-10 overflow-hidden bg-[#f5f5f5] flex items-center justify-center"
    >
      {/* background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),rgba(255,255,255,0))] pointer-events-none" />

      <div className="relative container mx-auto px-6 md:px-12 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-10">

        <div className="md:w-1/2 text-left">
          <h2 className="font-sans font-extrabold text-[52px] md:text-[66px] leading-[1.0] text-[#2a105d] tracking-tight">
            JOIN THE<br />
            WAITLIST NOW
          </h2>
        </div>

        <div className="md:w-1/2 flex justify-end">
          <div className="w-full max-w-[560px]">
            <form
              onSubmit={onSubmit}
              className="group flex items-center h-[46px] rounded-full border border-[#6125d8]/50 bg-white shadow-[0_6px_16px_rgba(97,37,216,0.12)] overflow-hidden transition-all duration-200 focus-within:shadow-[0_10px_26px_rgba(97,37,216,0.18)]"
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 h-full px-6 text-[15px] font-light font-ibm text-[#2a2a2a] placeholder:text-[#6b6b6b] bg-transparent outline-none"
                required
              />
              <button
                type="submit"
                disabled={!canSubmit || status.type === "loading"}
                className="h-full px-8 bg-[#6125d8] text-white font-inter font-medium text-[15px] hover:bg-[#5012b8] transition-colors duration-200 whitespace-nowrap"
              >
                {status.type === "loading" ? "Joining…" : "Join Waitlist"}
              </button>
            </form>

            {status.type === "success" ? (
              <p className="mt-3 text-[14px] font-inter text-emerald-700 leading-relaxed">
                {status.message}
              </p>
            ) : null}
            {status.type === "error" ? (
              <p className="mt-3 text-[14px] font-inter text-red-700 leading-relaxed">
                {status.message}
              </p>
            ) : null}
            {status.type === "idle" || status.type === "loading" ? (
              <p className="mt-3 text-[14px] font-inter text-[#6125d8] opacity-80 leading-relaxed">
                We&apos;ll email you as soon as the waitlist opens. Automated messaging service coming soon.
              </p>
            ) : null}
          </div>
        </div>

      </div>
    </section>
  );
}
