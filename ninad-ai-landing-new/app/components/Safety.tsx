const SAFETY = [
  { title: "A licensed voice, or nothing", body: "Every persona starts with a signed voice licence and a studio session. No scraped audio, ever." },
  { title: "Guardrails on every turn", body: "Refusals for medical, legal, and financial advice. Impersonation of third parties is blocked at the prompt layer." },
  { title: "Versioned system prompts", body: "Each persona has a reviewable prompt history. Creators can see and veto any change to how they behave." },
  { title: "Your data isn't the product", body: "Conversations are never sold, never used to train a third party, and deletable on request." },
];

export default function Safety() {
  return (
    <section id="safety" className="bg-nd-bg">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 md:px-10 py-16 sm:py-20">
        <div className="text-xs font-bold tracking-[0.14em] text-nd-accent mb-3.5 uppercase">Trust &amp; safety</div>
        <h2 className="font-display text-[36px] sm:text-[44px] tracking-tight text-nd-ink mb-9">
          Consent is the product.
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SAFETY.map((t) => (
            <div key={t.title} className="rounded-[18px] bg-nd-panel border border-nd-line-soft px-5 py-6">
              <div className="text-base font-bold text-nd-ink tracking-tight mb-2 leading-snug">{t.title}</div>
              <div className="text-[13.5px] leading-relaxed text-nd-muted">{t.body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
