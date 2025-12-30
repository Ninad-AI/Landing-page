const features = [
  {
    title: "Acoustic-Aware Architecture",
    description:
      "Our models listen like humans do analyzing tone, pitch, rhythm, and emotion to create speech that feels natural, not robotic.",
  },
  {
    title: "Emotion-Driven Output",
    description:
      "Every response adapts dynamically - excitement, calm, empathy so the voice matches the moment.",
  },
  {
    title: "Multilingual Core",
    description:
      "Built for a global audience, Ninad AI supports cross-language understanding and expressive speech in dozens of languages.",
  },
  {
    title: "Seamless Integration",
    description:
      "API-first and developer-friendly easily plug Ninad AI into apps, bots, assistants, and creative tools.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black pointer-events-none" />

      {/* Content */}
      <div className="relative max-w-[1280px] mx-auto px-8">
        {/* Section Title */}
        <h2 className="font-inter font-bold text-[94px] leading-[0.97] tracking-[-2.82px] text-center mb-4 gradient-text bg-[linear-gradient(180deg,#e7fdff_20%,#878787_150%)]">
          Why choose Ninad AI?
        </h2>

        {/* Subtitle */}
        <div className="font-inter font-medium text-[24px] leading-[1.03] text-white/80 max-w-[1149px] mx-auto mb-12">
          <p className="mb-0">Experience the next evolution in voice AI.</p>
          <p>
            Ninad AI understands tone, emotion, and context to create voices
            that feel truly human.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 gap-x-16 gap-y-8">
          {features.map((feature, index) => (
            <div key={index} className="relative">
              {/* Feature Card */}
              <div className="relative p-6">
                {/* Decorative dot */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[59px] h-[59px] rounded-full border border-[#6125d8]/50 opacity-60" />

                <div className="pl-16">
                  {/* Title with gradient */}
                  <h3 className="font-inter font-extrabold text-[30px] leading-[0.98] tracking-[-0.6px] mb-3 gradient-text bg-[linear-gradient(135deg,#e7fdff_20%,#98dbff_80%)]">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="font-inter font-semibold text-[11px] leading-[1.05] tracking-[-0.22px] text-white max-w-[434px]">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
