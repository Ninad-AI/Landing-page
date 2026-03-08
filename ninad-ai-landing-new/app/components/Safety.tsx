"use client";

import { useState, useRef, useEffect } from "react";

const safetyFeatures = [
  {
    id: "no-go",
    shortTitle: "Strict 'No-Go' Zones",
    title: 'Strict "No-Go" Zones Built Right In',
    description:
      "Built-in rules block anything off-limits: no romance/sex/kissing talk, no violence, harm, drugs, alcohol, politics, religion, or controversy. If a fan tries to nudge the conversation there, your AI politely flips the script back to your world.",
  },
  {
    id: "positive",
    shortTitle: "Family-Friendly",
    title: "Always Positive & Family-Friendly",
    description:
      "Your persona is all about that warm, genuine energy you bring to your content. No negativity, no sarcasm that stings, no deep dives into personal struggles unless it's a super-positive spin.",
  },
  {
    id: "monitoring",
    shortTitle: "Smart Monitoring",
    title: "Smart Monitoring & Quick Fixes",
    description:
      'You get full control too: Pause, edit responses, or even "unlearn" bits if it doesn\'t feel right. And our tech? Powered by top-notch AI models with built-in ethics layers, so it\'s not just rules—it\'s smart.',
  },
  {
    id: "trust",
    shortTitle: "Built on Trust",
    title: "Why Creators Trust This",
    description:
      "It's simple: Your AI handles endless fan chats 24/7, builds loyalty, and grows your audience—while you get peace of mind. No burnout, no scandals, just your best energy amplified safely.",
  },
];

export default function Safety() {
  const [activeTab, setActiveTab] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeTabStyle, setActiveTabStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    // Calculate the left offset and width of the active tab for the sliding pill
    const currentTab = tabRefs.current[activeTab];
    if (currentTab) {
      setActiveTabStyle({
        left: currentTab.offsetLeft,
        width: currentTab.offsetWidth,
      });
    }
  }, [activeTab]);

  const handleTabChange = (index: number) => {
    if (index === activeTab || isFading) return;

    setIsFading(true);
    setTimeout(() => {
      setActiveTab(index);
      setIsFading(false);
    }, 200); // 200ms blur fade out
  };

  return (
    <section
      id="safety"
      className="relative py-20 md:py-32 overflow-hidden bg-black"
    >
      <div className="relative container mx-auto px-6 md:px-12 lg:px-20 max-w-[1200px]">

        {/* Header Section */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex justify-center mb-6 relative">
            {/* Center subtle glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-primary/20 blur-[80px] rounded-full pointer-events-none -z-10"></div>

            <h2
              className="
                font-sans font-bold
                text-4xl md:text-6xl lg:text-[80px]
                leading-tight md:leading-none tracking-tighter
                bg-clip-text text-transparent
                bg-gradient-to-b from-white via-gray-300 to-gray-500
                pb-4
              "
            >
              Your Safety First
            </h2>
          </div>

          <div className="font-sans text-lg md:text-xl text-muted mx-auto space-y-4 relative z-10 max-w-3xl">
            <p className="text-white font-medium">
              Keeping Your AI Persona Safe, Fun, and Just Like You.
            </p>
            <p className="font-normal text-[#949494] text-base md:text-lg">
              Hey there, creator! We get it—handing over your digital twin to an AI
              sounds exciting, but the big question is: <em>What if things go sideways?</em>{" "}
              We've been there in our own chats with fans, and trust us, safety
              isn't just a checkbox for us—it's the foundation of everything we build.
            </p>
          </div>
        </div>

        {/* Interactive Tab Interface */}
        <div className="relative z-10 flex flex-col items-center">

          {/* Tab Nav Buttons */}
          <div className="relative flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12 w-full mx-auto max-w-fit p-1 bg-white/5 rounded-full border border-white/10 overflow-hidden">
            {/* Sliding Pill Background */}
            <div
              className="absolute top-1 bottom-1 bg-white rounded-full transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.15)] shadow-[0_0_20px_rgba(255,255,255,0.3)] z-0"
              style={{
                left: `${activeTabStyle.left}px`,
                width: `${activeTabStyle.width}px`,
              }}
            />

            {safetyFeatures.map((feature, index) => {
              const isActive = activeTab === index;
              return (
                <button
                  key={feature.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  onClick={() => handleTabChange(index)}
                  className={`
                    relative z-10 px-5 py-3 md:px-8 md:py-4 rounded-full text-sm md:text-base font-sans font-bold transition-all duration-300
                    ${isActive
                      ? "text-black"
                      : "text-[#949494] hover:text-white"
                    }
                  `}
                >
                  {feature.shortTitle}
                </button>
              );
            })}
          </div>

          {/* Active Tab Content Area */}
          <div className="w-full max-w-4xl mx-auto flex justify-center">
            <div
              className="relative w-full min-h-[250px] bg-gradient-to-b from-[#111111] to-[#050505] rounded-[32px] border border-white/5 p-6 md:p-8 lg:p-12 overflow-hidden flex items-center group"
            >
              {/* Animated Inner Content Wrapper */}
              <div
                className={`
                  flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full relative z-10
                  transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                  ${isFading ? "opacity-0 scale-[0.97] blur-[8px]" : "opacity-100 scale-100 blur-0"}
                `}
              >
                {/* Ambient Background subtle glow specific to active tab */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none transition-transform duration-1000 group-hover:scale-110"></div>

                {/* Left side large number */}
                <div className="flex-shrink-0 flex items-center justify-center">
                  <span
                    className="
                    font-sans font-black text-[100px] md:text-[140px] leading-none
                    text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent
                 "
                  >
                    0{activeTab + 1}
                  </span>
                </div>

                {/* Right side text content */}
                <div className="flex-1 flex flex-col justify-center overflow-hidden">
                  <h3
                    className="
                  font-sans font-extrabold
                  text-[24px] md:text-[30px] lg:text-[36px] leading-[1.1] tracking-tight
                  bg-clip-text text-transparent
                  bg-gradient-to-b from-[#FFFFFF] to-[#B18BFF]
                  mb-4
                "
                  >
                    {safetyFeatures[activeTab].title}
                  </h3>

                  <p className="font-sans font-normal text-sm md:text-base lg:text-lg leading-relaxed text-[#949494]">
                    {safetyFeatures[activeTab].description}
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Footer CTA */}
        <div className="mt-20 text-center max-w-3xl mx-auto">
          <p className="font-sans font-medium text-[#949494] text-lg lg:text-xl">
            Questions? We're here—let's talk it through. Your peace of mind matters most.
          </p>
          <span className="text-white mt-4 block font-semibold text-xl lg:text-2xl">Ready to launch worry-free?</span>
        </div>
      </div>
    </section>
  );
}
