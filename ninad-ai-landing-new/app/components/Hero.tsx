import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-[140px] pb-20 overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-[-175px] left-[-223px] w-[652px] h-[666px]">
        <div className="absolute inset-0 rounded-full bg-[#6125d8] blur-[200px] opacity-40" />
      </div>
      <div className="absolute top-[150px] right-[-100px] w-[567px] h-[552px]">
        <div className="absolute inset-0 rounded-full bg-[#00a9ff] blur-[180px] opacity-30" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-[1280px] mx-auto px-8">
        {/* Hero Text */}
        <div className="text-center mb-8">
          {/* Real-time badge */}
          <p className="font-inter font-extrabold text-[80px] text-white/90 uppercase leading-none tracking-tight">
            Real-time
          </p>

          {/* AI VOICE with Orb */}
          <div className="relative flex items-center justify-center -mt-4">
            <h1 className="font-inter font-extrabold text-[266px] leading-[0.85] tracking-[-18px] gradient-text bg-gradient-to-b from-[#e7fdff] from-[20%] to-[#878787] to-[150%]">
              <span>AI V</span>
              <span className="relative inline-block w-[256px]">
                {/* Orb placeholder */}
                <Image
                  src="/assets/hero-orb.png"
                  alt="Voice AI Visualization"
                  width={256}
                  height={256}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  priority
                />
              </span>
              <span className="tracking-[-0.5px]">ICE</span>
            </h1>
          </div>

          {/* That feels human */}
          <p className="font-inter font-extrabold text-[48px] text-white/90 uppercase leading-none -mt-6">
            that feels Human
          </p>
        </div>

        {/* Tagline */}
        <p className="font-roboto font-light text-[20px] text-[#ccd3d7] text-center tracking-[1.6px] max-w-[794px] mx-auto mt-8">
          Low-latency, expressive speech for apps, agents, and experiences ready
          to integrate in minutes.
        </p>
      </div>
    </section>
  );
}
