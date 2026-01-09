"use client";

import { useRef, useState, useCallback } from "react";

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
  const gridRef = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setGlowPos({ x, y, visible: true });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setGlowPos((prev) => ({ ...prev, visible: false }));
  }, []);

  return (
    <section
      id="features"
      className="relative py-20 md:py-32 overflow-hidden bg-black min-h-screen flex items-center"
    >
      <div className="relative container mx-auto px-6 md:px-12 lg:px-20 max-w-[1600px]">
        {/* Header - Spans both columns */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <h2
              className="
                font-sans font-bold
                text-4xl md:text-6xl lg:text-[94px]
                leading-none tracking-tighter
                bg-clip-text text-transparent
                bg-gradient-to-b from-white via-gray-300 to-gray-500
                pb-4
              "
            >
              Why choose Ninad AI?
            </h2>
          </div>

          <div className="font-sans font-medium text-lg md:text-2xl text-muted max-w-4xl mx-auto">
            <p className="mb-1">Experience the next evolution in voice AI.</p>
            <p>
              Ninad AI understands tone, emotion, and context to create voices
              that feel truly human.
            </p>
          </div>
        </div>

        {/* Features Grid Wrapper */}
        <div 
          ref={gridRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative grid grid-cols-1 md:grid-cols-2 gap-[12px] rounded-[24px] overflow-hidden"
        >
          {/* Cursor-following glow (Limited to the grid's area) */}
          <div
            className="pointer-events-none absolute w-[110px] h-[110px] rounded-full blur-[40px] transition-opacity duration-150 z-0 hidden md:block"
            style={{
              left: glowPos.x - 40,
              top: glowPos.y - 40,
              backgroundColor: "#B18BFF", // Brightest shade of purple
              opacity: glowPos.visible ? 0.9 : 0,
            }}
          />

          {features.map((feature, index) => {
            // Gradient peaking at the center intersection relative to their position
            const borderGradient = 
              index === 0 ? "bg-gradient-to-br from-transparent via-primary/10 to-primary-light" :
              index === 1 ? "bg-gradient-to-bl from-transparent via-primary/10 to-primary-light" :
              index === 2 ? "bg-gradient-to-tr from-transparent via-primary/10 to-primary-light" :
              "bg-gradient-to-tl from-transparent via-primary/10 to-primary-light";

            return (
              <div
                key={index}
                className={`relative p-[1px] rounded-[24px] z-10 ${borderGradient} flex`}
              >
                <div className="w-full h-full px-8 py-12 md:px-16 md:py-20 flex items-center justify-center bg-black rounded-[23px]">
                  <div className="w-full space-y-6 text-center flex flex-col items-center max-w-md">
                    <h3
                      className="
                        font-sans font-extrabold
                        text-[30px] leading-[0.98] tracking-[-0.6px]
                        bg-clip-text text-transparent
                        bg-gradient-to-b from-[#FFFFFF] to-[#B18BFF]
                        mb-4
                      "
                    >
                      {feature.title}
                    </h3>
                    <p className="font-sans font-normal text-sm md:text-base leading-relaxed text-[#949494] max-w-[85%]">
                      {feature.description}
                    </p>
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