const languages = [
  "ENGLISH",
  "HINDI",
  "MARATHI",
  "BENGALI",
  "ENGLISH",
  "HINDI",
  "GUJRATI",
  "TAMIL",
  "TELUGU",
  "KANNADA",
  "TAMIL",
  "TELUGU",
];

export default function Languages() {
  return (
    <section className="relative py-20 overflow-hidden bg-black">
      {/* Background with gradient */}
      <div className="absolute inset-0">
        {/* Glow effects */}
        <div className="absolute w-[644px] h-[448px] bg-[#6125d8] rounded-full blur-[200px] opacity-30 top-[100px] left-1/2 -translate-x-1/2" />
      </div>

      {/* Content */}
      <div className="relative w-[min(1170px,calc(100vw-110px))] mx-auto">
        {/* Section Title */}
        <h2 className="font-inter font-extrabold text-[62px] leading-none tracking-[-1.86px] text-white uppercase mb-4">
          Speak every language
        </h2>

        {/* Description */}
        <div className="font-inter font-normal text-[30px] leading-[1.13] text-[#f7f3ff] max-w-[802px] mb-12">
          <p className="mb-0">Ninad AI supports native speech in multiple languages.</p>
          <p>Localize a given voice to any accent or language.</p>
        </div>

        {/* Language Cards Marquee */}
        <div className="relative h-[137px] overflow-hidden w-screen -ml-[calc((100vw-min(1170px,calc(100vw-110px)))/2)]">
          {/* First row - scrolling left */}
          <div className="flex gap-4 animate-marquee mb-4">
            {[...languages, ...languages].map((lang, index) => (
              <div
                key={`row1-${index}`}
                className="flex-shrink-0 h-[61px] px-8 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <span className="font-inter font-semibold text-[16px] text-white uppercase tracking-wide">
                  {lang}
                </span>
              </div>
            ))}
          </div>

          {/* Second row - scrolling right */}
          <div className="flex gap-4 animate-marquee-reverse">
            {[...languages.reverse(), ...languages].map((lang, index) => (
              <div
                key={`row2-${index}`}
                className="flex-shrink-0 h-[61px] px-8 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
              >
                <span className="font-inter font-semibold text-[16px] text-white uppercase tracking-wide">
                  {lang}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
