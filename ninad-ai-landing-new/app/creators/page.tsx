"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "../components/ProfileCard";

interface Creator {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  handle: string;
  status: string;
  bio?: string;
}

const CREATORS: Creator[] = [
  {
    id: "pawan-kumar-001",
    name: "Pawan Kumar",
    role: "Influencer & Actor",
    imageUrl: "/assets/creators/pavan.png",
    handle: "pawan-kumar",
    status: "Active",
    bio: "Popular influencer and actor known for his versatile performances.",
  },
];

export default function CreatorsPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleTalk = (creator: Creator) => {
    router.push(`/creators/${creator.handle}`);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black selection:bg-primary/30">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div
          className="absolute left-[-26vw] top-[-12vw] h-[clamp(260px,56vw,700px)] w-[clamp(260px,56vw,700px)] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(97,37,216,0.6)_0%,transparent_70%)] animate-glow-drift"
        />
        <div
          className="absolute right-[-20vw] top-[16vw] h-[clamp(220px,42vw,500px)] w-[clamp(220px,42vw,500px)] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(59,130,246,0.45)_0%,transparent_70%)] animate-glow-drift-reverse"
        />
        <div className="absolute left-[20%] bottom-[-18vw] h-[clamp(260px,46vw,600px)] w-[clamp(360px,62vw,800px)] rounded-full blur-[160px] bg-[radial-gradient(circle,rgba(147,51,234,0.4)_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-[1600px] px-4 sm:px-6 md:px-10 lg:px-16 pt-28 sm:pt-32 md:pt-40 pb-16 sm:pb-20 md:pb-24">
        <div className={`text-center mb-8 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <h1 className="font-sans font-black text-3xl sm:text-4xl md:text-6xl lg:text-8xl xl:text-[110px] leading-none tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 pb-3 sm:pb-4">
            CREATORS
          </h1>
        </div>

        <div
          className={`font-sans font-medium text-base sm:text-lg md:text-xl text-center text-muted tracking-tight mb-12 sm:mb-16 md:mb-24 max-w-3xl mx-auto px-1 ${
            isVisible ? "animate-fade-in-up delay-100" : "opacity-0"
          }`}
        >
          <p className="mb-1">The icons redefining entertainment and influence.</p>
          <p>From the silver screen to your feed, meet the stars shaping culture.</p>
        </div>

        <div
          className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 md:gap-10 justify-items-center ${
            isVisible ? "animate-fade-in-up delay-200" : "opacity-0"
          }`}
        >
          {CREATORS.map((creator) => (
            <div key={creator.id} className="w-full max-w-[400px] flex justify-center">
              <ProfileCard
                name={creator.name}
                title={creator.role}
                avatarUrl={creator.imageUrl}
                behindGlowColor="rgba(97, 37, 216, 0.5)"
                onContactClick={() => handleTalk(creator)}
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
