"use client";

import { useEffect, useRef, useState } from "react";

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
  const tabContainerRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [activeTabStyle, setActiveTabStyle] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const updateActiveTabStyle = () => {
    const tabContainer = tabContainerRef.current;
    const currentTab = tabRefs.current[activeTab];

    if (!tabContainer || !currentTab) return;

    const containerRect = tabContainer.getBoundingClientRect();
    const tabRect = currentTab.getBoundingClientRect();

    setActiveTabStyle({
      left: tabRect.left - containerRect.left,
      top: tabRect.top - containerRect.top,
      width: tabRect.width,
      height: tabRect.height,
      opacity: 1,
    });
  };

  useEffect(() => {
    updateActiveTabStyle();

    const handleResize = () => updateActiveTabStyle();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
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
      className="relative overflow-hidden bg-black py-16 sm:py-20 md:py-24 lg:py-32"
    >
      <div className="relative container mx-auto max-w-300 px-4 sm:px-6 md:px-10 lg:px-20">

        {/* Header Section */}
        <div className="mb-10 text-center sm:mb-12 md:mb-16">
          <div className="relative mb-5 flex justify-center sm:mb-6">
            {/* Center subtle glow */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-22.5 w-55 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[80px] sm:h-25 sm:w-75"></div>

            <h2
              className="
                font-sans font-bold
                text-3xl sm:text-4xl md:text-6xl lg:text-[80px]
                leading-tight md:leading-none tracking-tighter
                bg-clip-text text-transparent
                bg-linear-to-b from-white via-gray-300 to-gray-500
                pb-4
              "
            >
              Your Safety First
            </h2>
          </div>

          <div className="relative z-10 mx-auto max-w-3xl space-y-3 font-sans text-base text-muted sm:space-y-4 sm:text-lg md:text-xl">
            <p className="font-medium text-white">
              Keeping Your AI Persona Safe, Fun, and Just Like You.
            </p>
            <p className="mx-auto max-w-[68ch] text-sm font-normal text-[#949494] sm:text-base md:text-lg">
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
          <div className="mb-8 w-full md:mb-12">
            <div
              ref={tabContainerRef}
              className="relative mx-auto grid w-full max-w-4xl grid-cols-1 gap-2 rounded-2xl border border-white/10 bg-white/5 p-1 sm:grid-cols-2 lg:grid-cols-4"
            >
              {/* Sliding active tab highlight that works across wrapped rows */}
              <div
                className="pointer-events-none absolute z-0 rounded-xl bg-white shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.15)] lg:rounded-full"
                style={{
                  left: `${activeTabStyle.left}px`,
                  top: `${activeTabStyle.top}px`,
                  width: `${activeTabStyle.width}px`,
                  height: `${activeTabStyle.height}px`,
                  opacity: activeTabStyle.opacity,
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
                      relative z-10 rounded-xl px-4 py-2.5 text-center font-sans text-xs font-bold leading-tight transition-colors duration-300 sm:px-5 sm:py-3 sm:text-sm md:text-base lg:rounded-full
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
          </div>

          {/* Active Tab Content Area */}
          <div className="w-full max-w-4xl mx-auto flex justify-center">
            <div
              className="group relative flex w-full items-center overflow-hidden rounded-3xl border border-white/5 bg-linear-to-b from-[#111111] to-[#050505] p-5 sm:p-6 md:min-h-62.5 md:rounded-4xl md:p-8 lg:p-12"
            >
              {/* Animated Inner Content Wrapper */}
              <div
                className={`
                  relative z-10 flex w-full flex-col items-center gap-5 text-center sm:gap-6 md:flex-row md:gap-10 md:text-left
                  transition-all duration-500 ease-[cubic-bezier(0.19,1,0.22,1)]
                  ${isFading ? "opacity-0 scale-[0.97] blur-sm" : "opacity-100 scale-100 blur-0"}
                `}
              >
                {/* Ambient Background subtle glow specific to active tab */}
                <div className="pointer-events-none absolute right-0 top-0 h-65 w-65 rounded-full bg-primary/10 blur-[100px] transition-transform duration-1000 group-hover:scale-110 md:h-100 md:w-100"></div>

                {/* Left side large number */}
                <div className="shrink-0 flex items-center justify-center">
                  <span
                    className="
                    font-sans font-black text-[72px] leading-none sm:text-[92px] md:text-[120px] lg:text-[140px]
                    text-transparent bg-clip-text bg-linear-to-b from-white/10 to-transparent
                 "
                  >
                    0{activeTab + 1}
                  </span>
                </div>

                {/* Right side text content */}
                <div className="flex-1 overflow-hidden">
                  <h3
                    className="
                  font-sans font-extrabold
                  text-xl sm:text-2xl md:text-[30px] lg:text-[36px] leading-[1.1] tracking-tight
                  bg-clip-text text-transparent
                  bg-linear-to-b from-[#FFFFFF] to-[#B18BFF]
                  mb-3 sm:mb-4
                "
                  >
                    {safetyFeatures[activeTab].title}
                  </h3>

                  <p className="mx-auto max-w-[65ch] font-sans text-sm font-normal leading-relaxed text-[#949494] sm:text-base lg:text-lg md:mx-0">
                    {safetyFeatures[activeTab].description}
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>

        {/* Footer CTA */}
        <div className="mx-auto mt-14 max-w-3xl text-center sm:mt-16 md:mt-20">
          <p className="font-sans text-base font-medium text-[#949494] sm:text-lg lg:text-xl">
            Questions? We're here—let's talk it through. Your peace of mind matters most.
          </p>
          <span className="mt-4 block text-lg font-semibold text-white sm:text-xl lg:text-2xl">Ready to launch worry-free?</span>
        </div>
      </div>
    </section>
  );
}
