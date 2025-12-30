// Orb image - use local asset
const imgImage4 = "/assets/hero-orb.png";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen overflow-hidden bg-black">
      {/* ===== Background glows ===== */}
      <div
        className="absolute h-[666px] w-[652px] left-[-223px] top-[-175px] pointer-events-none rounded-full blur-[100px] opacity-60"
        style={{ background: "radial-gradient(circle, rgba(97, 37, 216, 0.6) 0%, transparent 70%)" }}
      />
      <div
        className="absolute h-[552px] w-[567px] right-[-200px] top-[50px] pointer-events-none rounded-full blur-[100px] opacity-50"
        style={{ background: "radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 70%)" }}
      />
      <div
        className="absolute h-[400px] w-[800px] left-[-400px] bottom-[-100px] pointer-events-none rounded-full blur-[120px] opacity-40"
        style={{ background: "radial-gradient(circle, rgba(147, 51, 234, 0.5) 0%, transparent 70%)" }}
      />

      {/* ===== Hero content ===== */}
      <div className="relative z-10 flex flex-col items-center pt-[120px] pb-[120px] px-4 max-w-[1200px] mx-auto">
        <p className="font-['Inter'] font-extrabold text-[clamp(52px,7vw,76px)] text-[rgba(255,255,255,0.92)] uppercase leading-none text-center tracking-[-0.5px]">
          REAL-TIME
        </p>

        <div className="relative flex items-center justify-center gap-[6px] mt-[12px] leading-none">
          <span
            className="font-['Inter'] font-extrabold text-[clamp(140px,20vw,260px)] leading-[0.86] tracking-[-12px] lg:tracking-[-16px] bg-gradient-to-b from-[#e7fdff] from-[20%] to-[#878787] to-[150%] bg-clip-text"
            style={{ WebkitTextFillColor: "transparent" }}
          >
            AI V
          </span>

          <div className="relative w-[clamp(130px,14vw,240px)] h-[clamp(130px,14vw,240px)] flex-shrink-0 pointer-events-none self-center">
            <img
              src={imgImage4}
              alt="Voice Orb"
              className="w-[137%] h-[126%] absolute left-[-21%] top-[-15%] max-w-none"
            />
          </div>

          <span
            className="font-['Inter'] font-extrabold text-[clamp(140px,20vw,260px)] leading-[0.86] tracking-[-8px] lg:tracking-[-12px] bg-gradient-to-b from-[#e7fdff] from-[20%] to-[#878787] to-[150%] bg-clip-text"
            style={{ WebkitTextFillColor: "transparent" }}
          >
            ICE
          </span>
        </div>

        <p className="font-['Inter'] font-extrabold text-[clamp(26px,3.5vw,36px)] text-[rgba(255,255,255,0.92)] uppercase leading-none text-center mt-[24px]">
          THAT FEELS HUMAN
        </p>

        <p className="font-['Roboto'] font-light text-[14px] md:text-[18px] text-[#ccd3d7] text-center leading-[1.6] max-w-[700px] mt-[26px] tracking-[0.6px]">
          Low-latency, expressive speech for apps, agents, and experiences ready to integrate in minutes.
        </p>
      </div>
    </section>
  );
}
