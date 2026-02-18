'use client';

import { useState } from 'react';

const languages = [
  "English",
  "Hindi",
  "Marathi",
  "Tamil",
  "Telugu",
  "Kannada",
  "Bengali"
];

const indicLanguages = [
  "English",
  "हिंदी",
  "मराठी",
  "தமிழ்",
  "తెలుగు",
  "ಕನ್ನಡ",
  "বাংলা"
];

export default function Languages() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="relative py-16 md:py-32 overflow-hidden bg-black">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 text-center z-10 mb-16">
        <h2 className="font-sans font-bold text-4xl md:text-6xl lg:text-[110px] mb-6 pb-1 leading-[1.1] tracking-tight bg-gradient-to-b from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent">
          Speak Every Language
        </h2>

        <div className="font-roboto text-lg md:text-2xl text-muted max-w-3xl mx-auto">
          <p>Ninad AI supports native speech in multiple languages.</p>
          <p>Localize any voice to any accent or language seamlessly.</p>
        </div>
      </div>

      {/* Marquee Container */}
      <div className="relative w-full overflow-visible flex flex-col gap-4 py-6">
        {/* Row 1 */}
        <div
          className="flex gap-4 animate-marquee min-w-full overflow-visible"
          style={{ animationPlayState: hoveredIndex !== null && hoveredIndex < 100 ? 'paused' : 'running' }}
        >
          {[...languages, ...languages, ...languages, ...languages].map((lang, index) => (
            <div
              key={`row1-${index}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`
                flex-shrink-0 w-[206px] h-[61px] flex items-center justify-center rounded-2xl 
                transition-all duration-150 relative z-20
                ${hoveredIndex === index
                  ? 'bg-primary border-2 border-primary/80 scale-110 shadow-[0_0_50px_rgba(168,85,247,0.95)]'
                  : 'bg-white border border-black/10'
                }
              `}
            >
              <span className={`font-sans font-bold text-sm md:text-base tracking-widest ${hoveredIndex === index ? 'text-white' : 'text-black'}`}>
                {lang}
              </span>
            </div>
          ))}
        </div>

        {/* Row 2 (brick offset) */}
        <div
          className="flex gap-4 animate-marquee min-w-full translate-x-[111px] overflow-visible"
          style={{ animationPlayState: hoveredIndex !== null && hoveredIndex >= 100 ? 'paused' : 'running' }}
        >
          {[...indicLanguages, ...indicLanguages, ...indicLanguages, ...indicLanguages].map((lang, index) => (
            <div
              key={`row2-${index}`}
              onMouseEnter={() => setHoveredIndex(index + 100)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`
                flex-shrink-0 w-[206px] h-[61px] flex items-center justify-center rounded-2xl 
                transition-all duration-150 relative z-20
                ${hoveredIndex === index + 100
                  ? 'bg-primary border-2 border-primary/80 scale-110 shadow-[0_0_50px_rgba(168,85,247,0.95)]'
                  : 'bg-white border border-black/10'
                }
              `}
            >
              <span className={`font-sans font-bold text-sm md:text-base tracking-widest ${hoveredIndex === index + 100 ? 'text-white' : 'text-black'}`}>
                {lang}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
