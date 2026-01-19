'use client';
import { useState } from 'react';

// Using inline SVGs to remove image dependencies and easier styling
const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const CaseIcon = ({ index }: { index: number }) => {
  // Simple geometric or abstract icons based on index
  return (
    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white">
      {index === 0 && (
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
      )}
      {index === 1 && (
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>
      )}
      {index === 2 && (
         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>
      )}
      {index === 3 && (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
      )}
      {index === 4 && (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" /></svg>
      )}
    </div>
  );
};

export default function UseCases() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const cases = [
     {
        name: "Mental and Physical Health",
        items: [
          "Compassionate AI therapist",
          "Family Voice Support",
          "Multilingual Therapy Access",
          "Mindfulness Apps"
        ],
      },
      {
        name: "Education and Ed-Tech",
        items: [
          "Star Teacher Voice Cloning",
          "Interactive Tutoring Sessions",
          "Engaging Narrations",
          "Historical Figure Interactions"
        ],
      },
      {
        name: "Edgy and Futuristic",
        items: [
          "Emotion-Responsive NPCs",
          "Iconic Character Voices",
          "Global Esports Commentary"
        ],
      },
      {
        name: "Metaverse",
        items: [
          "Brand Ambassador Voices",
          "Multilingual Event Hosting",
          "Dynamic Storytelling",
          "Next-Gen Avatar Interaction"
        ],
      },
      {
        name: "Media and Entertainment",
        items: [
          "Interactive Ad Campaigns",
          "Real-time Sport Commentary",
          "Virtual Show Hosts"
        ],
      },
  ];

  return (
    <section id="use-cases" className="relative py-24 md:py-32 bg-black overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute left-0 bottom-0 w-full h-[500px] bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          
          {/* Left: Text Content & Sticky Header */}
          <div className="lg:sticky lg:top-40 self-start">
            <h2 className="font-sans font-bold text-5xl md:text-7xl lg:text-8xl leading-tight text-white mb-8">
              <span className="text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#999999_100%)]">Empowering</span>{' '}
              <br />
              <span className="text-transparent bg-clip-text bg-[linear-gradient(180deg,#FFFFFF_0%,#999999_100%)]">Every Interaction</span>
            </h2>
            <p className="font-roboto text-lg md:text-xl text-muted leading-relaxed max-w-lg mb-12">
              From enterprise solutions to creative projects, Ninad AI adapts to your specific needs with uncompromised quality and emotion.
            </p>
            
            {/* <button className="px-8 py-4 bg-white text-black font-sans font-bold rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                Explore All Solutions
            </button> */}
          </div>

          {/* Right: Accordion */}
          <div className="flex flex-col gap-4">
            {cases.map((item, index) => (
              <div 
                key={index} 
                className={`
                    border rounded-[24px] overflow-hidden transition-all duration-300
                    ${openIndex === index ? 'bg-white/5 border-primary/50 shadow-lg shadow-primary/10' : 'bg-transparent border-white/10 hover:border-white/20'}
                `}
              >
                <button
                  onClick={() => setOpenIndex(prev => prev === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <CaseIcon index={index} />
                    <h3 className={`font-sans font-bold text-lg md:text-2xl ${openIndex === index ? 'text-white' : 'text-white/60'}`}>
                      {item.name}
                    </h3>
                  </div>
                  <div className={`transition-transform duration-300 ${openIndex === index ? 'rotate-180 text-primary' : 'text-white/40'}`}>
                    <ArrowIcon />
                  </div>
                </button>

                <div
                  className={
                    `grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-in-out motion-reduce:transition-none ` +
                    (openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')
                  }
                >
                  <div
                    className="min-h-0 cursor-pointer"
                    onClick={() => setOpenIndex(null)}
                  >
                    <div className="px-6 md:px-8 pb-8 pl-[80px] md:pl-[104px]">
                      <ul className="space-y-3">
                        {item.items.map((sub, i) => (
                          <li key={i} className="flex items-center gap-3 text-white/80 font-roboto">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            {sub}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
