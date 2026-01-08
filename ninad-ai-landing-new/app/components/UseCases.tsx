"use client";

import { useState } from "react";

const useCases = [
  {
    name: "Mental and Physical Health",
    items: [
      "Compassionate AI therapist: Empathetic, comforting and supportive",
      "Family Voice Support: Soothing, calming and connection",
      "Multilingual Therapy Access: Real-time, Multilingual, Communication",
      "Mindfulness Apps: Dynamic, Sensitive, Meditation",
    ],
  },
  {
    name: "Education and Ed-Tech",
    items: [
      "Star Teacher Voice Cloning: Personalized, Authentic, Inspiring",
      "Interactive Tutoring Sessions: Interactive, Adaptive, Feedback-Loop",
      "Engaging Narrations: Expressive, Captivating, Immersive",
      "Historical Figure Narration: Historical Character Interactions: Star-Stuck, Iconic, Mesmerizing",
    ],
  },
  {
    name: "Edgy and Futuristic",
    items: [
      "Emotion-Responsive NPCs: Savage, Fun, Engaging",
      "Iconic Character Voices: Nostalgic, Goated, Epic Conversations",
      "Global Esports: Worldwide, Multilingual, Real-time",
    ],
  },
  {
    name: "Metaverse",
    items: [
      "Brand Ambassador Voices: Resonant, Consistent, Trusted",
      "Multilingual Events: Real-Time, Barrier free, Impactful Communication",
      "Dynamic Audiobook Narration: Character-driven, Immersive, Multilingual",
      "Next-Gen Film Dubbing: Cinematic, Seamless, Emotive",
    ],
  },
  {
    name: "Media and Entertainment",
    items: [
      "Interactive Ads, Reimagined: Disruptive, Engaging, Impactful",
      "Live Event Commentary: Real-time, Multilingual, Thrilling",
      "Virtual Show Hosts: Witty, Entertaining, Creative",
    ],
  },
];

// Arrow icon component
function ArrowIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? "rotate-[-90deg]" : "rotate-0"}`}
    >
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function UseCases() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="use-cases" className="relative py-20 overflow-hidden bg-black">
      {/* Background glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-[2746px] h-[1746px] left-[-166px] top-[-251px]">
          <div className="absolute w-[800px] h-[800px] bg-[#6125d8] rounded-full blur-[200px] opacity-20 top-[400px] left-[200px]" />
          <div className="absolute w-[600px] h-[600px] bg-[#00a9ff] rounded-full blur-[180px] opacity-15 top-[600px] right-[400px]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-[1600px] mx-auto px-8 z-10">
        {/* Section Title */}
        <h2 className="font-inter font-extrabold text-[80px] leading-none tracking-[-2.4px] text-white uppercase mb-12">
          Real-World Use
        </h2>

        {/* Use Cases Accordion */}
        <div className="max-w-[803px] flex flex-col gap-2">
          {useCases.map((useCase, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="relative"
              >
                {/* Accordion Item */}
                <div
                  onClick={() => toggleAccordion(index)}
                  className={`bg-[#1f1f1f] border border-[#9968fa] rounded-[5px] cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                    isOpen 
                      ? "opacity-100" 
                      : openIndex !== null 
                        ? "opacity-30 hover:opacity-50" 
                        : "opacity-50 hover:opacity-70"
                  }`}
                >
                  {/* Header */}
                  <div className="h-[77px] flex items-center justify-between px-6">
                    {/* Use Case Name */}
                    <h3
                      className="font-inter font-light text-[42px] leading-none tracking-[-1.26px] bg-clip-text text-transparent"
                      style={{
                        backgroundImage:
                          "linear-gradient(102deg, rgba(255, 255, 255, 0.8) 3%, #6125d8 96%)",
                      }}
                    >
                      {useCase.name}
                    </h3>

                    {/* Arrow */}
                    <div className="text-white/60 flex-shrink-0 ml-4">
                      <ArrowIcon isOpen={isOpen} />
                    </div>
                  </div>

                  {/* Content - Expandable */}
                  <div
                    className="overflow-hidden"
                    style={{
                      maxHeight: isOpen ? "400px" : "0px",
                      opacity: isOpen ? 1 : 0,
                      transition: "max-height 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <ul className="px-6 pb-6 pt-2 list-disc list-inside space-y-2">
                      {useCase.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="font-nunito text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px] leading-[1.32] tracking-[-0.66px] text-white/90 ml-4"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
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
