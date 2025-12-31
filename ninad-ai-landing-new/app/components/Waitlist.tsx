export default function Waitlist() {
  return (
    <section id="waitlist" className="relative w-full h-[164px] overflow-hidden">
      {/* Background - light grey with subtle texture */}
      <div className="absolute inset-0 w-full h-full bg-[#f5f5f7]" />
      
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content Container */}
      <div className="relative h-full w-[min(1170px,calc(100vw-110px))] mx-auto flex items-center justify-between">
        {/* Left Side - Title */}
        <div className="flex-shrink-0">
          <h2 className="font-['Inter'] font-extrabold text-[32px] md:text-[40px] leading-[1.1] text-[#1a0a4a] uppercase tracking-tight">
            JOIN THE<br />WAITLIST NOW
          </h2>
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-col items-end">
          {/* Input Row */}
          <div className="flex items-center">
            {/* Email Input */}
            <input
              type="email"
              placeholder="Enter your email"
              className="w-[400px] md:w-[560px] h-[53px] px-6 bg-white border-2 border-[#d4d4d8] rounded-l-full font-['IBM_Plex_Mono'] font-light text-[18px] md:text-[21px] text-[#212121] placeholder:text-[#212121]/70 outline-none focus:border-[#6125d8] transition-colors"
            />

            {/* Submit Button */}
            <button className="w-[140px] md:w-[158px] h-[53px] bg-[#6125d8] rounded-r-full hover:bg-[#7a3ef0] transition-colors flex items-center justify-center -ml-[2px]">
              <span className="font-['Inter'] font-medium text-[16px] md:text-[20px] text-white whitespace-nowrap">
                Join Waitlist
              </span>
            </button>
          </div>

          {/* Helper Text */}
          <p className="mt-3 max-w-[641px] font-['Inter'] text-[12px] md:text-[14px] text-[#6125d8] opacity-70 tracking-[-0.42px] leading-tight text-right">
            We'll email you as soon as the waitlist opens. Automated messaging service coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}
