"use client";

import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();

  return (
    <section id="hero" className="relative overflow-hidden bg-nd-bg pt-28 sm:pt-32 md:pt-36 pb-16 sm:pb-20 md:pb-24">
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 grid grid-cols-1 md:grid-cols-[1.05fr_.95fr] gap-10 md:gap-16 items-center overflow-hidden">
        <div
          className="absolute -top-28 -right-24 h-[350px] w-[350px] sm:h-[460px] sm:w-[460px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(142,118,190,.2), rgba(142,118,190,0) 68%)" }}
        />

        <div className="relative z-10">
          <h1 className="font-display text-[40px] sm:text-[56px] md:text-[68px] lg:text-[74px] leading-[0.99] tracking-tight text-nd-ink mb-5">
            Talk to the people who <em className="not-italic italic text-nd-accent">shaped you</em>.
          </h1>
          <p className="text-base sm:text-lg leading-relaxed text-nd-muted max-w-[460px] mb-8">
            Not a chatbot pretending. A licensed voice, grounded in everything they&apos;ve actually said — answering you out loud, in your language.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push("/creators")}
              className="px-7 py-4 rounded-2xl bg-nd-ink text-nd-bg font-bold text-[15px] flex items-center gap-2.5 hover:bg-[#302C36] transition-colors cursor-pointer"
            >
              Browse creators
              <span className="text-lg leading-none">→</span>
            </button>
            <button
              onClick={() => router.push("/for-creators")}
              className="px-7 py-4 rounded-2xl border border-nd-line bg-white text-nd-ink font-bold text-[15px] hover:border-nd-ink transition-colors cursor-pointer"
            >
              I&apos;m a creator
            </button>
          </div>
        </div>

        <div className="relative z-10 hidden md:flex justify-center">
          <div className="w-full max-w-[340px] rounded-[28px] bg-nd-darker p-6 pb-6 shadow-[0_40px_90px_-30px_rgba(28,26,31,.5)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-sm font-bold text-nd-bg">Live call</div>
                <div className="text-[11px] font-semibold text-[#8E76BE] mt-0.5">AI persona · voice licensed</div>
              </div>
              <span className="px-2.5 py-1.5 rounded-full bg-[#221E2C] text-xs font-bold text-nd-bg tabular-nums">02:14</span>
            </div>

            <div className="flex justify-center py-4 pb-6">
              <div className="relative w-[168px] h-[168px] flex items-center justify-center">
                <span className="absolute rounded-full animate-nd-ripple" style={{ width: 140, height: 140, border: "1px solid rgba(142,118,190,.5)" }} />
                <span className="absolute rounded-full animate-nd-ripple" style={{ width: 140, height: 140, border: "1px solid rgba(142,118,190,.4)", animationDelay: "1.7s" }} />
                <span
                  className="absolute rounded-full animate-nd-spin"
                  style={{
                    width: 152,
                    height: 152,
                    background: "conic-gradient(from 0deg, rgba(142,118,190,.42), rgba(107,75,168,.05), rgba(192,96,60,.3), rgba(142,118,190,.42))",
                    filter: "blur(22px)",
                  }}
                />
                <span
                  className="relative rounded-full animate-nd-breathe"
                  style={{
                    width: 112,
                    height: 112,
                    background: "radial-gradient(120% 120% at 32% 26%, #C9B6EC 0%, #8E76BE 42%, #5A3E96 78%, #3E2A6B 100%)",
                    boxShadow: "inset 0 -12px 28px rgba(28,18,54,.6), 0 16px 40px -12px rgba(107,75,168,.65)",
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 min-h-[92px]">
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[9px] font-extrabold tracking-wide text-[#6F6878]">YOU</span>
                <span className="text-[13px] leading-relaxed text-[#8B8496] text-right">I&apos;ve been stuck on this for weeks.</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-extrabold tracking-wide text-[#6F6878]">CREATOR</span>
                <span className="text-[13px] leading-relaxed text-[#F2EFF6]">Let&apos;s talk through it — from the start.</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[#221E2C] w-fit mx-auto px-3.5 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8E76BE] animate-nd-blink" />
              <span className="text-[11.5px] font-bold text-[#C9C3D1]">Creator is speaking</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
