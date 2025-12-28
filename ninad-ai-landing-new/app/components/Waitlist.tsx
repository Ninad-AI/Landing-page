// Background shape SVG
const imgSubtract = "http://localhost:3845/assets/480d6992a47716c59401d292ee359771b2232319.svg";

export default function Waitlist() {
  return (
    <section className="relative w-full h-[164px] overflow-hidden rounded-none">
      {/* Full-width Background Shape SVG */}
      <div className="absolute inset-0 w-full h-full rounded-none">
        <img
          src={imgSubtract}
          alt=""
          className="w-full h-full object-cover object-center rounded-none"
        />
      </div>

      {/* Content Container */}
      <div className="relative h-full w-full max-w-[1920px] mx-auto flex items-center px-4">
        {/* Right Side - Form */}
        <div className="absolute left-[clamp(35%,42%,45%)] flex flex-col items-start">
          {/* Input Row */}
          <div className="flex items-center">
            {/* Email Input */}
            <input
              type="email"
              placeholder="Enter your email"
              className="w-[clamp(350px,38vw,560px)] h-[53px] px-6 bg-white border-2 border-[#d4d4d8] rounded-l-full font-['IBM_Plex_Mono'] font-light text-[clamp(16px,1.5vw,21px)] text-[#212121] placeholder:text-[#212121]/70 outline-none focus:border-[#6125d8] transition-colors"
            />

            {/* Submit Button */}
            <button className="w-[clamp(130px,11vw,158px)] h-[53px] bg-[#6125d8] rounded-r-full hover:bg-[#7a3ef0] transition-colors flex items-center justify-center -ml-[2px]">
              <span className="font-['Inter'] font-medium text-[clamp(16px,1.4vw,20px)] text-white whitespace-nowrap">
                Join Waitlist
              </span>
            </button>
          </div>

          {/* Helper Text */}
          <p className="mt-3 max-w-[90%] xl:max-w-[641px] font-['Inter'] text-[clamp(12px,1vw,14px)] text-[#6125d8] opacity-70 tracking-[-0.42px] leading-tight">
            We'll email you as soon as the waitlist opens. Automated messaging service coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}
