const STEPS = [
  { n: "01", title: "You speak", ms: "live", body: "Hold the button and talk the way you would to a person. Hindi, Tamil, or all three in one sentence." },
  { n: "02", title: "We transcribe", ms: "~120ms", body: "Speech-to-text tuned for Indian accents and code-switching, not a US-English model with a shrug." },
  { n: "03", title: "The persona thinks", ms: "~330ms", body: "A model grounded in that figure's own corpus, behind a versioned system prompt and live guardrails." },
  { n: "04", title: "They answer", ms: "~250ms", body: "Their licensed voice, streaming back word by word. You hear the reply while it forms." },
];

export default function Features() {
  return (
    <section id="features" className="bg-nd-dark text-nd-bg">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 py-16 sm:py-20 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-[.9fr_1.1fr] gap-10 md:gap-16 items-start">
          <div className="md:sticky md:top-28">
            <div className="text-xs font-bold tracking-[0.14em] text-[#8E76BE] mb-3.5 uppercase">How it works</div>
            <h2 className="font-display text-[36px] sm:text-[44px] leading-[1.05] tracking-tight mb-3.5">
              Four steps, under a second.
            </h2>
            <p className="text-[15px] leading-relaxed text-[#A8A2AE] max-w-[380px] mb-7">
              Speech in, speech out. No typing, no waiting for a paragraph to render.
            </p>
            <div className="inline-flex items-center gap-3 rounded-2xl bg-[#262230] px-5 py-4">
              <span className="font-display text-3xl leading-none">~700ms</span>
              <span className="text-[13px] leading-tight text-[#A8A2AE] max-w-[200px]">round trip — about the length of a held breath.</span>
            </div>
          </div>
          <div className="flex flex-col">
            {STEPS.map((s) => (
              <div key={s.n} className="flex gap-6 py-6 border-b border-[#302C36]">
                <div className="flex-none w-11 font-display text-3xl leading-none text-[#8E76BE]">{s.n}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-3.5">
                    <span className="text-lg font-bold tracking-tight">{s.title}</span>
                    <span className="flex-none text-xs font-bold text-[#6F6878] tabular-nums">{s.ms}</span>
                  </div>
                  <div className="text-[14.5px] leading-relaxed text-[#A8A2AE] mt-1.5 max-w-[480px]">{s.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
