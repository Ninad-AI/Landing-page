// Orb image - use local asset
const imgImage4 = "/assets/hero-orb.png";

export default function Hero() {
  return (
    <>
      <section className="relative w-full min-h-screen overflow-hidden">
      {/* ===== Background glows ===== */}
      <div
        className="absolute h-[780px] w-[760px] left-[-260px] top-[-220px] pointer-events-none rounded-full blur-[120px] opacity-60"
        style={{
          background:
            "radial-gradient(circle, rgba(97, 37, 216, 0.65) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute h-[650px] w-[670px] right-[-240px] top-[60px] pointer-events-none rounded-full blur-[120px] opacity-50"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.55) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute h-[460px] w-[900px] left-[-450px] bottom-[-140px] pointer-events-none rounded-full blur-[140px] opacity-45"
        style={{
          background:
            "radial-gradient(circle, rgba(147, 51, 234, 0.55) 0%, transparent 70%)",
        }}
      />

      {/* ===== Hero content ===== */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen pt-[170px] pb-[170px] px-6 max-w-[1700px] mx-auto space-y-8">
        {/* REAL-TIME */}
        <p className="font-['Inter'] font-extrabold text-[clamp(60px,7vw,88px)] text-[rgba(255,255,255,0.92)] uppercase leading-none text-center tracking-[-0.8px]">
          REAL-TIME
        </p>

        <br></br>
        <br></br>

        {/* AI VOICE */}
        <div className="relative flex items-center justify-center leading-none px-6">
          {/* AI V */}
          <span
            className="
              font-['Inter']
              font-extrabold
              text-[clamp(150px,19vw,280px)]
              leading-[0.85]
              tracking-[-10px] lg:tracking-[-16px]
              bg-gradient-to-b from-[#e7fdff] from-[18%] to-[#878787] to-[150%]
              bg-clip-text
              px-[0.14em]
              overflow-visible
            "
            style={{ WebkitTextFillColor: "transparent" }}
          >
            AI V
          </span>

          {/* Orb */}
          <div
            className="
              relative
              w-[clamp(160px,14.5vw,280px)]
              h-[clamp(160px,14.5vw,280px)]
              flex-shrink-0
              pointer-events-none
              self-center
              mx-[-0.1em]
            "
            style={{ animation: "orb-breathe 6s ease-in-out infinite", transformOrigin: "50% 50%" }}
          >
            <img
              src={imgImage4}
              alt="Voice Orb"
              className="absolute left-[-22%] top-[-16%] w-[140%] h-[130%] max-w-none"
            />
          </div>

          {/* ICE */}
          <span
            className="
              font-['Inter']
              font-extrabold
              text-[clamp(150px,19vw,280px)]
              leading-[0.85]
              tracking-[-8px] lg:tracking-[-14px]
              bg-gradient-to-b from-[#e7fdff] from-[18%] to-[#878787] to-[150%]
              bg-clip-text
              px-[0.14em]
              overflow-visible
            "
            style={{ WebkitTextFillColor: "transparent" }}
          >
            ICE
          </span>
        </div>

        <br></br>
        <br></br>

        {/* TAGLINE */}
        <p className="font-['Inter'] font-extrabold text-[clamp(32px,3.6vw,44px)] text-[rgba(255,255,255,0.92)] uppercase leading-none text-center">
          THAT FEELS HUMAN
        </p>

        {/* SUBTEXT */}
        <p className="font-['Roboto'] font-light text-[16px] md:text-[22px] text-[#ccd3d7] text-center leading-[1.65] max-w-[960px] tracking-[0.7px]">
          Low-latency, expressive speech for apps, agents, and experiences ready to
          integrate in minutes.
        </p>
      </div>
      </section>
    </>
  );
}
