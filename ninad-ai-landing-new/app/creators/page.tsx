"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "../components/ProfileCard";
import { useAuthStore } from "../lib/stores";
import { trialApi } from "../lib/api";
import type { TrialStatus } from "../lib/types";

interface Creator {
  id: string;
  name: string;
  role: string;
  imageUrl: string;
  handle: string;
  status: string;
  bio?: string;
  /** Real backend influencer id — used to match against /trial/status, not for display. */
  influencerId: string;
}

const CREATORS: Creator[] = [
  {
    id: "nirupam-001",
    name: "Nirupam Paritala",
    role: "Actor & Producer",
    imageUrl: "/assets/creators/nirupam.jpeg",
    handle: "nirupam",
    status: "Active",
    bio: "Acclaimed actor and producer known for his powerful performances and creative vision.",
    influencerId: "nirupam",
  },
  {
    id: "aneri-001",
    name: "Aneri Thakkar",
    role: "Coach & Influencer",
    imageUrl: "/assets/creators/aneri-2.jpg",
    handle: "aneri-thakkar",
    status: "Active",
    bio: "Captivating audiences with her stellar performances and magnetic screen presence.",
    influencerId: "aneri",
  },
  // NOTE: Beauty Khan temporarily removed from the frontend. Uncomment to re-enable.
  // {
  //   id: "beauty-khan-001",
  //   name: "Beauty Khan",
  //   role: "Artist and Creator",
  //   imageUrl: "/assets/creators/beauty-khan.jpg",
  //   handle: "beauty-khan",
  //   status: "Active",
  //   bio: "An imaginative artist and creator bringing bold ideas to life through striking visuals and expressive storytelling.",
  //   influencerId: "beauty_khan",
  // },
  {
    id: "sona-dey-001",
    name: "Sona Dey",
    role: "Model & Influencer",
    imageUrl: "/assets/creators/sona.png",
    handle: "sona-dey",
    status: "Active",
    bio: "A model and influencer known for bold, expressive visuals and a magnetic presence.",
    influencerId: "sona_dey",
  },
  {
    id: "ganesha-001",
    name: "Lord Ganesha",
    role: "Guide & Guardian",
    imageUrl: "/assets/creators/ganesha.jpg",
    handle: "ganesha",
    status: "Active",
    bio: "A divine guide and guardian offering wisdom, blessings, and protection for life's new beginnings.",
    influencerId: "ganeshji",
  },
];

function formatTrialDuration(seconds: number): string {
  if (seconds > 0 && seconds % 60 === 0) {
    const minutes = seconds / 60;
    return `${minutes} min free`;
  }
  return `${seconds}s free`;
}

export default function CreatorsPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const { isHydrated, isAuthenticated } = useAuthStore();
  const [trialsByInfluencerId, setTrialsByInfluencerId] = useState<Record<string, TrialStatus>>({});

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Trial eligibility can only be checked once signed in (the endpoint requires
  // a JWT) — unauthenticated visitors simply see no free-trial badges.
  useEffect(() => {
    if (!isHydrated || !isAuthenticated) return;
    let cancelled = false;
    trialApi
      .getStatus()
      .then((status) => {
        if (cancelled) return;
        const byId: Record<string, TrialStatus> = {};
        if (status.enabled) {
          for (const trial of status.trials) {
            byId[trial.influencer_id] = trial;
          }
        }
        setTrialsByInfluencerId(byId);
      })
      .catch(() => {
        // Silently ignore — badges just won't show; normal paid flow is unaffected.
      });
    return () => {
      cancelled = true;
    };
  }, [isHydrated, isAuthenticated]);

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
          {CREATORS.map((creator) => {
            const trial = trialsByInfluencerId[creator.influencerId];
            return (
              <div key={creator.id} className="relative w-full max-w-[400px] flex justify-center">
                {trial?.available && (
                  <span className="absolute top-3 left-3 z-20 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-black shadow-[0_4px_16px_rgba(16,185,129,0.4)]">
                    {formatTrialDuration(trial.duration_seconds)}
                  </span>
                )}
                <ProfileCard
                  name={creator.name}
                  title={creator.role}
                  avatarUrl={creator.imageUrl}
                  behindGlowColor="rgba(97, 37, 216, 0.5)"
                  onContactClick={() => handleTalk(creator)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
