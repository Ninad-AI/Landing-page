const languages = [
  "ENGLISH",
  "HINDI",
  "MARATHI",
  "BENGALI",
  "JAPANESE",
  "GERMAN",
  "SPANISH",
  "FRENCH"
];

const indicLanguages = [
  "HINDI",
  "GUJARATI",
  "TAMIL",
  "TELUGU",
  "KANNADA", 
  "MALAYALAM",
  "PUNJABI",
  "ODIA"
];

export default function Languages() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-black">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 text-center z-10 mb-16">
        <h2 className="font-sans font-bold text-4xl md:text-5xl lg:text-7xl text-white mb-6 tracking-tight">
          Speak Every Language
        </h2>

        <div className="font-roboto text-lg md:text-2xl text-muted max-w-3xl mx-auto">
          <p>Ninad AI supports native speech in multiple languages.</p>
          <p>Localize any voice to any accent or language seamlessly.</p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-hidden flex flex-col gap-6">
        
        {/* Row 1: Global Languages */}
        <div className="flex gap-4 animate-marquee min-w-full">
          {[...languages, ...languages, ...languages, ...languages].map((lang, index) => (
            <div
              key={`row1-${index}`}
              className="flex-shrink-0 px-8 py-4 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:border-primary/50 transition-colors"
            >
              <span className="font-sans font-bold text-sm md:text-base text-white/90 uppercase tracking-widest">
                {lang}
              </span>
            </div>
          ))}
        </div>

        {/* Row 2: Regional Languages (Reverse) */}
        <div className="flex gap-4 animate-marquee-reverse min-w-full">
          {[...indicLanguages, ...indicLanguages, ...indicLanguages, ...indicLanguages].map((lang, index) => (
            <div
              key={`row2-${index}`}
              className="flex-shrink-0 px-8 py-4 flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hover:border-accent-blue/50 transition-colors"
            >
              <span className="font-sans font-bold text-sm md:text-base text-white/90 uppercase tracking-widest">
                {lang}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
