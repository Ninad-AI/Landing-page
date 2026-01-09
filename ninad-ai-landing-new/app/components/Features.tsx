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

  const GAP = 14;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!gridRef.current) return;

      const rect = gridRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Use percentages or flexible units if possible, but for this specific hover effect, JS calc is needed.
      // We ensure the grid is responsive via CSS, and these calculations work on the rendered dimensions.
      const gridWidth = rect.width;
      const gridHeight = rect.height;
      const colWidth = (gridWidth - GAP) / 2;
      const rowHeight = (gridHeight - GAP) / 2;

      const nearVerticalGap = x >= colWidth - 30 && x <= colWidth + GAP + 30;
      const nearHorizontalGap = y >= rowHeight - 30 && y <= rowHeight + GAP + 30;

      if (nearVerticalGap || nearHorizontalGap) {
        setGlowPos({ x, y, visible: true });
      } else {
        setGlowPos((prev) => ({ ...prev, visible: false }));
      }
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setGlowPos((prev) => ({ ...prev, visible: false }));
  }, []);
  return (
    <section
      id="features"
      className="relative py-20 md:py-32 overflow-x-hidden overflow-y-visible bg-black min-h-screen flex items-center"
    >
      {/* Content */}
      <div className="relative container mx-auto px-6 md:px-12 lg:px-20 max-w-[1600px]">
        {/* Section Title */}
        <div className="flex justify-center mb-8">
          <h2
            className="
              font-sans
              font-bold
              text-4xl md:text-6xl lg:text-[94px]
              leading-none
              tracking-tighter
              text-center
              bg-clip-text
              text-transparent
              bg-gradient-to-b from-white via-gray-300 to-gray-500
              pb-4
            "
          >
            Why choose Ninad AI?
          </h2>
        </div>

        {/* Subtitle */}
        <div className="font-sans font-medium text-lg md:text-2xl text-muted max-w-4xl mx-auto mb-16 text-center">
          <p className="mb-1">
            Experience the next evolution in voice AI.
          </p>
          <p className="mb-0">
            Ninad AI understands tone, emotion, and context to create voices
            that feel truly human.
          </p>
        </div>

        {/* Features Grid */}
        <div
          ref={gridRef}
          className="relative grid grid-cols-1 md:grid-cols-2 gap-[14px] overflow-hidden rounded-2xl"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Cursor-following glow in the gap */}
          <div
            className="pointer-events-none absolute w-[70px] h-[70px] rounded-full blur-[30px] transition-opacity duration-100 z-0 hidden md:block"
            style={{
              left: glowPos.x - 35,
              top: glowPos.y - 35,
              backgroundColor: "var(--color-primary-light)",
              opacity: glowPos.visible ? 1 : 0,
            }}
          />

          {features.map((feature, index) => {
            const isLeft = index % 2 === 0;
            const isTop = index < 2;
            
            return (
              <div
                key={index}
                className="relative px-8 py-12 md:px-16 md:py-20 flex items-center justify-center bg-white/5 backdrop-blur-sm z-10 border border-white/5 md:border-none"
              >
                {/* Desktop Gradients (using design system colors) */}
                <div className="hidden md:block">
                    {/* Right gradient border (for left column cards) */}
                    {isLeft && (
                      <div
                        className="absolute right-0 w-[1px]"
                        style={{
                          top: isTop ? '12px' : '0',
                          bottom: isTop ? '0' : '12px',
                          height: isTop ? 'calc(100% - 12px)' : 'calc(100% - 12px)',
                          background: isTop 
                            ? 'linear-gradient(180deg, transparent 0%, var(--primary) 100%)'
                            : 'linear-gradient(180deg, var(--primary) 0%, transparent 100%)',
                        }}
                      />
                    )}
                    
                    {/* Left gradient border (for right column cards) */}
                    {!isLeft && (
                      <div
                        className="absolute left-0 w-[1px]"
                        style={{
                          top: isTop ? '12px' : '0',
                          bottom: isTop ? '0' : '12px',
                          height: isTop ? 'calc(100% - 12px)' : 'calc(100% - 12px)',
                          background: isTop 
                            ? 'linear-gradient(180deg, transparent 0%, var(--primary) 100%)'
                            : 'linear-gradient(180deg, var(--primary) 0%, transparent 100%)',
                        }}
                      />
                    )}
                    
                    {/* Bottom gradient border (for top row cards) */}
                    {isTop && (
                      <div
                        className="absolute bottom-0 h-[1px]"
                        style={{
                          left: isLeft ? '12px' : '0',
                          right: isLeft ? '0' : '12px',
                          width: isLeft ? 'calc(100% - 12px)' : 'calc(100% - 12px)',
                          background: isLeft 
                            ? 'linear-gradient(90deg, transparent 0%, var(--primary) 100%)'
                            : 'linear-gradient(90deg, var(--primary) 0%, transparent 100%)',
                        }}
                      />
                    )}
                    
                    {/* Top gradient border (for bottom row cards) */}
                    {!isTop && (
                      <div
                        className="absolute top-0 h-[1px]"
                        style={{
                          left: isLeft ? '12px' : '0',
                          right: isLeft ? '0' : '12px',
                          width: isLeft ? 'calc(100% - 12px)' : 'calc(100% - 12px)',
                          background: isLeft 
                            ? 'linear-gradient(90deg, transparent 0%, var(--primary) 100%)'
                            : 'linear-gradient(90deg, var(--primary) 0%, transparent 100%)',
                        }}
                      />
                    )}
                </div>
              
                <div className="w-full space-y-4 text-center flex flex-col items-center max-w-md">
                {/* Title */}
                <h3
                  className="
                    font-sans
                    font-extrabold
                    text-2xl md:text-[30px]
                    leading-tight
                    tracking-tight
                    bg-clip-text
                    text-transparent
                    bg-gradient-to-b from-white to-primary-light
                    pb-2
                  "
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="
                    font-sans
                    font-medium
                    text-sm md:text-base
                    leading-relaxed
                    text-muted
                  "
                >
                  {feature.description}
                </p>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
