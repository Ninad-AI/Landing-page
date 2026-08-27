'use client';

import { useState } from 'react';

const FAQS = [
  { q: "Is it actually their voice?", a: "Yes — a licensed clone built from a studio session with them, not scraped audio. They hear it and sign off before the link goes live." },
  { q: "Does it know the real person's life?", a: "It's grounded in what they gave us: interviews, books, podcasts, notes, timelines. Outside that corpus it says it doesn't know rather than inventing." },
  { q: "What happens to my conversation?", a: "The transcript is yours. The creator sees aggregate topics, never your individual call. Delete it any time and it goes." },
  { q: "Can I make it say anything?", a: "No. Every turn passes guardrails, the system prompt is versioned and reviewed, and flagged calls get looked at by a human." },
  { q: "What if the call drops?", a: "Minutes are credited back automatically. You only pay for time you actually spent talking." },
];

export default function UseCases() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="use-cases" className="bg-nd-bg">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 py-16 sm:py-20 grid grid-cols-1 md:grid-cols-[.8fr_1.2fr] gap-10 md:gap-16 items-start">
        <h2 className="font-display text-[36px] sm:text-[44px] tracking-tight text-nd-ink md:sticky md:top-28">
          Questions
        </h2>
        <div className="border-t border-nd-line">
          {FAQS.map((f, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={f.q} className="border-b border-nd-line">
                <button
                  onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
                  aria-expanded={isOpen}
                  className="w-full flex items-start justify-between gap-5 py-5 text-left cursor-pointer"
                >
                  <span className="text-base font-bold text-nd-ink tracking-tight leading-snug">{f.q}</span>
                  <span className={`relative flex-none w-4 h-4 mt-1 ${isOpen ? "text-nd-accent" : "text-nd-dim"}`}>
                    <span className="absolute inset-0 m-auto h-[2px] w-3.5 bg-current transition-colors duration-300" />
                    <span
                      className={`absolute inset-0 m-auto h-3.5 w-[2px] bg-current transition-all duration-300 ease-out ${
                        isOpen ? "rotate-90 opacity-0" : "opacity-100"
                      }`}
                    />
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div
                      className={`text-[15px] leading-relaxed text-nd-muted pb-6 pr-8 max-w-[560px] transition-opacity duration-300 ${
                        isOpen ? "opacity-100 delay-100" : "opacity-0"
                      }`}
                    >
                      {f.a}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
