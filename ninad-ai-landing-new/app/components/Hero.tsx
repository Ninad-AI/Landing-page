import Image from "next/image";

export default function Hero() {
  return (
    <section id="hero" className="relative flex w-full min-h-svh md:min-h-screen flex-col items-center justify-center overflow-hidden pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-16 md:pb-20">
      {/* ===== Background glows ===== */}
      <div className="absolute inset-0 pointer-events-none opacity-50">
        <div className="absolute left-[-30vw] top-[-18vw] h-[clamp(280px,62vw,780px)] w-[clamp(280px,60vw,760px)] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(97,37,216,0.65)_0%,transparent_70%)]" />
        <div className="absolute right-[-28vw] top-[4vw] h-[clamp(250px,52vw,650px)] w-[clamp(260px,54vw,670px)] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(59,130,246,0.55)_0%,transparent_70%)]" />
        <div className="absolute bottom-[-14vw] left-[-42vw] h-[clamp(220px,38vw,460px)] w-[clamp(380px,78vw,900px)] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(147,51,234,0.55)_0%,transparent_70%)]" />
      </div>

      {/* ===== Hero content ===== */}
      <div className="relative z-10 flex w-full max-w-[90vw] sm:max-w-[85vw] md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-425 flex-col items-center justify-center space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 px-4 sm:px-6 md:px-8">
        {/* REAL-TIME */}
        <h1 className="font-sans font-extrabold text-[clamp(28px,7vw,88px)] text-white/90 uppercase leading-none text-center tracking-tight">
          REAL-TIME
        </h1>

        {/* AI VOICE w/ Orb */}
        <div className="relative flex items-center justify-center leading-none max-w-full">
          {/* AI V */}
          <span
            className="
              font-sans
              font-extrabold
              text-[clamp(32px,14vw,280px)]
              leading-[0.85]
              tracking-tighter
              bg-linear-to-b from-[#e7fdff] via-[#b0b0b0] to-[#878787]
              bg-clip-text
              text-transparent
              pr-[0.08em]
            "
          >
            AI V
          </span>

          {/* Orb */}
          <div
            className="
              relative
              w-[clamp(32px,14vw,280px)]
              h-[clamp(32px,14vw,280px)]
              shrink-0
              cursor-pointer
              mx-[0.08em]
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
              sizes="(max-width: 480px) 64px, (max-width: 768px) 108px, (max-width: 1024px) 144px, 280px"
              className="object-contain scale-110 z-10 transition-all duration-700 group-hover:brightness-150"
            />
          </div>

          {/* ICE */}
          <span
            className="
              font-sans
              font-extrabold
              text-[clamp(32px,14vw,280px)]
              leading-[0.85]
              tracking-tighter
              bg-linear-to-b from-[#e7fdff] via-[#b0b0b0] to-[#878787]
              bg-clip-text
              text-transparent
              pl-[0.08em]
            "
          >
            ICE
          </span>
        </div>

        {/* TAGLINE */}
        <h2 className="font-sans font-extrabold text-[clamp(18px,4.5vw,44px)] text-white/90 uppercase leading-none text-center tracking-tight">
          THAT FEELS HUMAN
        </h2>

        {/* SUBTEXT */}
        <p className="font-roboto font-light text-xs sm:text-sm md:text-base lg:text-xl text-muted text-center leading-relaxed max-w-2xl lg:max-w-4xl tracking-wide px-2 sm:px-4">
          Low-latency, expressive speech for apps, agents, and experiences ready to
          integrate in minutes.
        </p>
      </div>
    </section>
  );
}
