"use client";

import { useState } from "react";

const CREATOR_STEPS = [
  { n: "01", title: "One studio session", body: "Ninety minutes reading scripts we wrote to capture your range — laughing, thinking, disagreeing." },
  { n: "02", title: "Hand us your archive", body: "Interviews, podcasts, books, old posts, a voice note of things you actually believe. We do the ingestion." },
  { n: "03", title: "Approve the persona", body: "You talk to it first. Tell us what sounds wrong and what it should never discuss. We version every change." },
  { n: "04", title: "Post your link", body: "ninad.live/creators/your-name goes in your bio. That is the whole distribution step." },
];

const WE_HANDLE = [
  { title: "Payments & payouts", body: "UPI, cards, GST invoices, weekly settlement to your account." },
  { title: "Concurrency", body: "Ten or ten thousand simultaneous calls, same latency." },
  { title: "Ingestion pipeline", body: "We chunk, embed, and keep your corpus current as you publish more." },
  { title: "Guardrails", body: "Topic bans, refusal policy, abuse detection, human review of flagged calls." },
  { title: "Prompt versioning", body: "Every behaviour change is diffed, dated, and reversible." },
];

export default function ForCreatorsPage() {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [knownFor, setKnownFor] = useState("");
  const [applied, setApplied] = useState(false);

  const canSubmit = name.trim().length > 0 && handle.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setApplied(true);
  };

  // Desktop: sticky sidebar next to the hero. Mobile: same card, moved to
  // the end of the page (after "what we handle") per the mobile design —
  // rendered once per breakpoint and toggled with CSS so both share state.
  const applyCard = (
    <div className="rounded-[22px] bg-nd-panel border border-nd-line-soft p-6 sm:p-7">
      <h3 className="font-display text-2xl text-nd-ink mb-1.5">Apply</h3>
      <p className="text-[13.5px] leading-relaxed text-nd-muted mb-5">
        We onboard a handful a month. Tell us who you are and we&apos;ll come back within a week.
      </p>

      {applied ? (
        <div className="rounded-2xl bg-white border border-[#D6E2D8] text-center p-6 animate-nd-up">
          <div className="text-2xl mb-2">✓</div>
          <div className="text-[15px] font-bold text-nd-ink">We&apos;ve got it.</div>
          <div className="text-[13px] text-nd-muted mt-1.5">Expect a reply from a human, not a persona.</div>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3.5 rounded-xl border border-nd-line bg-white text-sm text-nd-ink outline-none focus:border-nd-accent transition-colors"
          />
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="Instagram or X handle"
            className="w-full px-4 py-3.5 rounded-xl border border-nd-line bg-white text-sm text-nd-ink outline-none focus:border-nd-accent transition-colors"
          />
          <input
            value={knownFor}
            onChange={(e) => setKnownFor(e.target.value)}
            placeholder="What are you known for?"
            className="w-full px-4 py-3.5 rounded-xl border border-nd-line bg-white text-sm text-nd-ink outline-none focus:border-nd-accent transition-colors"
          />
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full py-4 rounded-xl bg-nd-ink text-nd-bg font-bold text-[14.5px] hover:bg-[#302C36] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            Send application
          </button>
        </div>
      )}
    </div>
  );

  return (
    <main className="relative min-h-screen bg-nd-bg">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-[1.1fr_.9fr] gap-10 md:gap-16 items-start mb-16">
          <div>
            <h1 className="font-display text-[40px] sm:text-[52px] md:text-[62px] leading-[1.02] tracking-tight text-nd-ink mb-5">
              Your voice, answering, <em className="not-italic text-nd-accent">while you sleep</em>.
            </h1>
            <p className="text-base sm:text-[17px] leading-relaxed text-nd-muted max-w-[480px] mb-8">
              You have more people wanting your time than there are hours. Ninad turns your archive and your voice into a persona that can be in ten thousand conversations at once — and pays you for every one.
            </p>
            <div className="flex gap-8 sm:gap-10 py-6 border-y border-nd-line">
              <div>
                <div className="font-display text-3xl sm:text-4xl text-nd-ink leading-none">70%</div>
                <div className="text-xs text-nd-dim mt-2 leading-tight">of every session, to you</div>
              </div>
              <div>
                <div className="font-display text-3xl sm:text-4xl text-nd-ink leading-none">90min</div>
                <div className="text-xs text-nd-dim mt-2 leading-tight">one studio session, once</div>
              </div>
              <div>
                <div className="font-display text-3xl sm:text-4xl text-nd-ink leading-none">∞</div>
                <div className="text-xs text-nd-dim mt-2 leading-tight">concurrent conversations</div>
              </div>
            </div>
          </div>

          <div className="hidden md:block md:sticky md:top-28">{applyCard}</div>
        </div>

        <div className="text-xs font-bold tracking-[0.13em] text-nd-dim uppercase mb-5">What you do</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {CREATOR_STEPS.map((s) => (
            <div key={s.n} className="rounded-[18px] bg-white border border-nd-line p-5">
              <div className="font-display text-2xl text-nd-accent mb-3">{s.n}</div>
              <div className="text-[15.5px] font-bold text-nd-ink tracking-tight mb-1.5">{s.title}</div>
              <div className="text-[13.5px] leading-relaxed text-nd-muted">{s.body}</div>
            </div>
          ))}
        </div>

        <div className="rounded-[24px] bg-nd-ink text-nd-bg p-7 sm:p-9 mb-10 md:mb-0">
          <div className="text-xs font-bold tracking-[0.13em] text-[#8E76BE] uppercase mb-5">What we handle</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-x-12 sm:gap-y-4">
            {WE_HANDLE.map((h) => (
              <div key={h.title} className="flex gap-3 items-start">
                <span className="flex-none text-[#8E76BE] text-sm leading-relaxed">→</span>
                <div className="flex-1 min-w-0 text-[14.5px] leading-relaxed">
                  <span className="font-bold text-nd-bg">{h.title}</span>
                  <span className="text-[#A8A2AE]"> — {h.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:hidden">{applyCard}</div>
      </div>
    </main>
  );
}
