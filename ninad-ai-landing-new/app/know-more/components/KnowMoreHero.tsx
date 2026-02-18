"use client";

import Link from "next/link";

export default function KnowMoreHero() {
  return (
    <section className="relative pt-48 pb-32 overflow-hidden min-h-screen flex flex-col items-center bg-[#05030b]">
      {/* Background Orbits */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] pointer-events-none opacity-20">
        <div className="absolute inset-0 border border-primary/20 rounded-full animate-[spin_60s_linear_infinite]" />
        <div className="absolute inset-[100px] border border-primary/10 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      {/* Hero Glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10" />

      <div className="container mx-auto max-w-7xl px-6 z-10 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-12 rounded-full border border-white/10 bg-white/5 backdrop-blur-md opacity-0 animate-reveal">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-white/60 text-xs font-bold tracking-[0.3em] uppercase">The Future of Interaction</span>
        </div>

        <h1 className="font-sans font-bold text-5xl md:text-7xl lg:text-[9vw] text-white mb-10 leading-[0.9] md:leading-[0.8] tracking-tighter opacity-0 animate-reveal [animation-delay:200ms]">
          Meet your<br />
          <span className="bg-linear-to-b from-white via-primary-light to-primary bg-clip-text text-transparent italic">Digital Soul.</span>
        </h1>

        <p className="font-roboto text-xl md:text-2xl text-white/50 mb-16 leading-relaxed max-w-2xl opacity-0 animate-reveal [animation-delay:400ms]">
          A high-fidelity AI persona that captures your essence,
          shares your wisdom, and engages your audience 24/7.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 mb-32 opacity-0 animate-reveal [animation-delay:600ms]">
          <Link
            href="#how-it-works"
            className="px-12 py-5 rounded-full bg-primary text-white font-roboto font-bold text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110 shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)]"
          >
            Create Your Persona
          </Link>
          <Link
            href="/book-demo"
            className="px-12 py-5 rounded-full border border-white/20 text-white font-roboto font-bold text-lg hover:bg-white/5 transition-all duration-300"
          >
            Watch Demo
          </Link>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(3deg); }
        }
        @keyframes reveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-reveal {
          animation: reveal 1s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
      `}</style>
    </section>
  );
}
