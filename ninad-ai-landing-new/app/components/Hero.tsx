import Image from "next/image";

// Background glow assets
const imgEllipse4 = "http://localhost:3845/assets/e44577d0a20b1b3420867d954fe5151527d1da0b.svg";
const imgEllipse2 = "http://localhost:3845/assets/ef06fbfc3ae4efda65590dedb8ff886158e09fd7.svg";
const imgEllipse1 = "http://localhost:3845/assets/a8380cdd2cd8fa6410a89d4ebe26d4ef2536385e.svg";
// Orb image
const imgImage4 = "http://localhost:3845/assets/18082cc40595bf0a0bf88d3c446face94decd0cd.png";
// Feature label gradient texture
const imgEmotionDrivenOutput = "http://localhost:3845/assets/8409aab01c8c4a934a36384458d2d3721610a9d5.png";
// Features grid connector SVG
const imgGroup62 = "http://localhost:3845/assets/a2fbc248b1ec71ecdc8f1538eac9d8fdebc4166a.svg";

export default function Hero() {
  return (
    <section className="relative w-full min-h-[700px] overflow-hidden bg-black">
      {/* ========== BACKGROUND GLOWS ========== */}
      {/* Top-left purple glow */}
      <div className="absolute h-[666px] left-[-223px] top-[-175px] w-[652px] pointer-events-none">
        <div className="absolute inset-[-98.59%_-100.71%]">
          <img alt="" className="block max-w-none size-full" src={imgEllipse4} />
        </div>
      </div>
      {/* Top-right blue glow */}
      <div className="absolute h-[552px] right-[-200px] top-[50px] w-[567px] pointer-events-none">
        <div className="absolute inset-[-62.03%_-60.39%]">
          <img alt="" className="block max-w-none size-full" src={imgEllipse2} />
        </div>
      </div>
      {/* Bottom glow */}
      <div className="absolute h-[400px] bottom-[-100px] left-[-400px] w-[800px] pointer-events-none">
        <div className="absolute inset-[-44.38%_-27.7%]">
          <img alt="" className="block max-w-none size-full" src={imgEllipse1} />
        </div>
      </div>

      {/* ========== MAIN HERO CONTENT ========== */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-[140px] pb-[80px] px-4 max-w-[1920px] mx-auto">
        
        {/* REAL-TIME text */}
        <p className="font-['Inter'] font-extrabold text-[80px] text-[rgba(255,255,255,0.9)] uppercase leading-none text-center">
          REAL-TIME
        </p>

        {/* AI VOICE with Orb - Group 58 */}
        <div className="relative flex items-center justify-center mt-[82px] mx-auto">
          {/* AI V */}
<span
  className="
    font-['Inter']
    font-extrabold
    text-[266px]
    leading-[0.85]
    tracking-[-18.62px]
    bg-gradient-to-b
    from-[#e7fdff]
    from-[20.909%]
    to-[#878787]
    to-[153.64%]
    bg-clip-text
    inline-block
    pr-[20px]
  "
  style={{ WebkitTextFillColor: 'transparent' }}
>
  AI V
</span>


          {/* Orb - positioned inline */}
          <div className="relative w-[256px] h-[256px] flex-shrink-0 mx-4 pointer-events-none">
            <img
              src={imgImage4}
              alt="Voice Orb"
              className="w-[136.71%] h-[125.68%] absolute left-[-21.36%] top-[-15.03%] max-w-none"
            />
          </div>

          {/* ICE */}
          <span 
            className="
              font-['Inter']
              font-extrabold
              text-[266px]
              leading-[0.85]
              tracking-[-0.48px]
              bg-gradient-to-b
              from-[#e7fdff]
              from-[20.909%]
              to-[#878787]
              to-[153.64%]
              bg-clip-text
            "
            style={{ WebkitTextFillColor: 'transparent' }}
          >
            ICE
          </span>
        </div>



        {/* THAT FEELS HUMAN text */}
        <p className="font-['Inter'] font-extrabold text-[48px] text-white uppercase leading-none text-center mt-[83px]">
          THAT FEELS HUMAN
        </p>

        {/* Tagline */}
        <p 
          className="font-['Roboto'] font-light text-[17px] text-[#ccd3d7] text-center leading-relaxed max-w-[794px] mt-[50px] tracking-[0.1em]"
        >
          Low-latency, expressive speech for apps, agents, and experiences ready to integrate in minutes.
        </p>

      </div>
    </section>
  );
}
