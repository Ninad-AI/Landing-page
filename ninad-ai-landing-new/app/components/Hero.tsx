import Image from "next/image";

export default function Hero() {
  return (
    <section id="hero" className="relative w-full min-h-screen overflow-hidden flex flex-col items-center justify-center pt-24 md:pt-32 pb-16 md:pb-20">
      {/* ===== Background glows ===== */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute h-[780px] w-[760px] left-[-260px] top-[-220px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(97,37,216,0.65)_0%,transparent_70%)]" />
        <div className="absolute h-[650px] w-[670px] right-[-240px] top-[60px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(59,130,246,0.55)_0%,transparent_70%)]" />
        <div className="absolute h-[460px] w-[900px] left-[-450px] bottom-[-140px] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(147,51,234,0.55)_0%,transparent_70%)]" />
      </div>

      {/* ===== Hero content ===== */}
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-[1700px] px-4 md:px-6 space-y-6 md:space-y-8 lg:space-y-12">
        {/* REAL-TIME */}
        <h1 className="font-sans font-extrabold text-[clamp(32px,8vw,88px)] text-white/90 uppercase leading-none text-center tracking-tight">
          REAL-TIME
        </h1>

        {/* AI VOICE w/ Orb */}
        <div className="relative flex items-center justify-center leading-none">
          {/* AI V */}
          <span
            className="
              font-sans
              font-extrabold
              text-[clamp(60px,18vw,280px)]
              leading-[0.85]
              tracking-tighter
              bg-gradient-to-b from-[#e7fdff] via-[#b0b0b0] to-[#878787]
              bg-clip-text
              text-transparent
              pr-1
            "
          >
            AI V
          </span>

          {/* Orb */}
          <div
            className="
              relative
              w-[clamp(60px,18vw,280px)]
              h-[clamp(60px,18vw,280px)]
              flex-shrink-0
              cursor-pointer
              mx-[0.15em]
              group
              z-20
            "
          >
            {/* Ambient glow behind orb */}
            <div
              className="
                absolute inset-0 
                bg-primary/30 blur-[60px] rounded-full 
                scale-75 animate-pulse
                transition-all duration-700
                group-hover:bg-primary/60 group-hover:blur-[100px] group-hover:scale-100
              "
            />

            <Image
              src="/assets/hero-orb.png"
              alt="Voice Orb"
              fill
              className="object-contain scale-110 z-10 transition-all duration-700 group-hover:brightness-150"
            />
          </div>

          {/* ICE */}
          <span
            className="
              font-sans
              font-extrabold
              text-[clamp(60px,18vw,280px)]
              leading-[0.85]
              tracking-tighter
              bg-gradient-to-b from-[#e7fdff] via-[#b0b0b0] to-[#878787]
              bg-clip-text
              text-transparent
              pl-1
            "
          >
            ICE
          </span>
        </div>

        {/* TAGLINE */}
        <h2 className="font-sans font-extrabold text-[clamp(20px,5vw,44px)] text-white/90 uppercase leading-none text-center tracking-tight">
          THAT FEELS HUMAN
        </h2>

        {/* SUBTEXT */}
        <p className="font-roboto font-light text-sm md:text-xl text-muted text-center leading-relaxed max-w-4xl tracking-wide px-2 md:px-4">
          Low-latency, expressive speech for apps, agents, and experiences ready to
          integrate in minutes.
        </p>
      </div>
    </section>
  );
}
