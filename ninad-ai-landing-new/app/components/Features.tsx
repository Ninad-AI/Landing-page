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
      className="relative py-32 overflow-x-hidden overflow-y-visible bg-black min-h-screen flex items-center"
    >
      {/* Content */}
      <div className="relative max-w-[1600px] mx-auto px-8">
        {/* Section Title */}
        <div className="flex justify-center mb-10">
          <h2
            className="
              font-inter
              font-bold
              text-[130px]
              leading-[1.08]
              tracking-[-3.9px]
              text-center
              gradient-text
              bg-[linear-gradient(180deg,#e7fdff_20%,#878787_150%)]
              overflow-visible
              pb-[0.2em]
            "
            style={{ WebkitTextFillColor: "transparent" }}
          >
            Why choose Ninad AI?
          </h2>
        </div>

        {/* Subtitle */}
        <div className="font-inter font-medium text-[32px] leading-[1.25] text-white/80 max-w-[1500px] mx-auto mb-20 text-center overflow-visible">
          <p className="mb-1">
            Experience the next evolution in voice AI.
          </p>
          <p className="mb-0 pb-[0.15em]">
            Ninad AI understands tone, emotion, and context to create voices
            that feel truly human.
          </p>
        </div>

        {/* Features Grid */}
        <div
          ref={gridRef}
          className="relative grid grid-cols-1 md:grid-cols-2 gap-[14px] overflow-hidden"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Cursor-following glow in the gap */}
          <div
            className="pointer-events-none absolute w-[70px] h-[70px] rounded-full blur-[30px] transition-opacity duration-100 z-0"
            style={{
              left: glowPos.x - 35,
              top: glowPos.y - 35,
              backgroundColor: "#9968FA",
              opacity: glowPos.visible ? 1 : 0,
            }}
          />

          {features.map((feature, index) => {
            const isLeft = index % 2 === 0;
            const isTop = index < 2;
            
            return (
              <div
                key={index}
                className="relative px-16 py-20 flex items-center justify-center bg-black overflow-hidden z-10 rounded-[12px]"
                style={{
                  border: '1px solid rgba(111, 90, 154, 0.15)',
                }}
              >
                {/* Right gradient border (for left column cards) */}
                {isLeft && (
                  <div
                    className="absolute right-0 w-[1px]"
                    style={{
                      top: isTop ? '12px' : '0',
                      bottom: isTop ? '0' : '12px',
                      height: isTop ? 'calc(100% - 12px)' : 'calc(100% - 12px)',
                      background: isTop 
                        ? 'linear-gradient(180deg, transparent 0%, #6125D8 100%)'
                        : 'linear-gradient(180deg, #6125D8 0%, transparent 100%)',
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
                        ? 'linear-gradient(180deg, transparent 0%, #6125D8 100%)'
                        : 'linear-gradient(180deg, #6125D8 0%, transparent 100%)',
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
                        ? 'linear-gradient(90deg, transparent 0%, #6125D8 100%)'
                        : 'linear-gradient(90deg, #6125D8 0%, transparent 100%)',
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
                        ? 'linear-gradient(90deg, transparent 0%, #6125D8 100%)'
                        : 'linear-gradient(90deg, #6125D8 0%, transparent 100%)',
                    }}
                  />
                )}
              
                <div className="w-full space-y-5 text-center flex flex-col items-center">
                {/* Title */}
                <h3
                  className="
                    font-inter
                    font-extrabold
                    text-[44px]
                    leading-[1.08]
                    tracking-[-0.88px]
                    gradient-text
                    bg-[linear-gradient(180deg,#ffffff_0%,#b18bff_100%)]
                    overflow-visible
                    pb-[0.18em]
                  "
                  style={{ WebkitTextFillColor: "transparent" }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="
                    font-inter
                    font-semibold
                    text-[18px]
                    leading-[1.35]
                    tracking-[-0.3px]
                    text-white
                    max-w-[600px]
                    overflow-visible
                    pb-[0.12em]
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
