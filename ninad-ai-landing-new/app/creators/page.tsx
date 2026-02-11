"use client";

import { useEffect, useState } from "react";
import ProfileCard from "../components/ProfileCard";

interface Creator {
    id: number;
    name: string;
    role: string;
    imageUrl: string;
    handle: string;
    status: string;
}

const CREATORS: Creator[] = [
    {
        id: 1,
        name: "Leonardo DiCaprio",
        role: "Actor & Environmentalist",
        imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
        handle: "leo",
        status: "Action"
    },
    {
        id: 2,
        name: "Scarlett Johansson",
        role: "Actress & Producer",
        imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1888&auto=format&fit=crop",
        handle: "scarlett",
        status: "On Set"
    },
    {
        id: 3,
        name: "Robert Downey Jr.",
        role: "Actor & Producer",
        imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1887&auto=format&fit=crop",
        handle: "rdj",
        status: "Filming"
    },
    {
        id: 4,
        name: "Natalie Portman",
        role: "Actress & Director",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
        handle: "natalie",
        status: "Directing"
    },
    {
        id: 5,
        name: "Keanu Reeves",
        role: "Actor & Musician",
        imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
        handle: "keanu",
        status: "Rehearsing"
    },
    {
        id: 6,
        name: "Emma Watson",
        role: "Actress & Activist",
        imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1887&auto=format&fit=crop",
        handle: "emma",
        status: "Reading"
    }
];

export default function CreatorsPage() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <main className="relative min-h-screen overflow-hidden bg-black selection:bg-primary/30">
            {/* ===== Background glows (matching Hero) ===== */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute h-[700px] w-[700px] left-[-200px] top-[-100px] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(97,37,216,0.6)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '8s' }} />
                <div className="absolute h-[500px] w-[500px] right-[-150px] top-[200px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(59,130,246,0.45)_0%,transparent_70%)] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
                <div className="absolute h-[600px] w-[800px] left-[30%] bottom-[-200px] rounded-full blur-[160px] bg-[radial-gradient(circle,rgba(147,51,234,0.4)_0%,transparent_70%)]" />
            </div>

            {/* ===== Content ===== */}
            <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20 max-w-[1600px] pt-36 md:pt-44 pb-24">
                {/* Section Header */}
                <div className={`text-center mb-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                    <h1
                        className="
              font-sans font-black
              text-4xl md:text-6xl lg:text-[110px]
              leading-none tracking-tight
              bg-clip-text text-transparent
              bg-gradient-to-b from-white to-white/40
              pb-4
            "
                    >
                        CREATORS
                    </h1>
                </div>

                <div className={`font-sans font-medium text-lg md:text-xl text-center text-muted tracking-tight mb-20 md:mb-28 max-w-3xl mx-auto ${isVisible ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
                    <p className="mb-1">The icons redefining entertainment and influence.</p>
                    <p>
                        From the silver screen to your feed, meet the stars shaping culture.
                    </p>
                </div>

                {/* Creators Grid */}
                <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 justify-items-center ${isVisible ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
                    {CREATORS.map((creator) => (
                        <div key={creator.id} className="w-full max-w-[400px] flex justify-center">
                            <ProfileCard
                                name={creator.name}
                                title={creator.role}
                                avatarUrl={creator.imageUrl}
                                followers={100 + creator.id * 8}
                                following={50 + creator.id * 4}
                                behindGlowColor="rgba(97, 37, 216, 0.5)"
                                onContactClick={() => console.log(`Clicked ${creator.name}`)}
                            />
                        </div>
                    ))}
                </div>

                {/* Join Team CTA Removed */}
            </div>
        </main>
    );
}
