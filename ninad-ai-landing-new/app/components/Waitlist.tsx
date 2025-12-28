export default function Waitlist() {
  return (
    <section className="relative py-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black" />

      {/* Content */}
      <div className="relative max-w-[1280px] mx-auto px-8">
        {/* Section Title */}
        <h2 className="font-inter font-extrabold text-[80px] leading-none tracking-[-2.4px] text-white uppercase mb-8">
          JOIN THE
          <br />
          WAITLIST NOW
        </h2>

        {/* Email Input Form */}
        <div className="flex gap-4 max-w-[720px]">
          {/* Email Input */}
          <div className="flex-1 relative h-[53px] bg-white rounded-[8px] overflow-hidden">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full h-full px-6 font-ibm-mono font-light text-[21px] text-[#212121] placeholder:text-[#212121]/70 outline-none"
            />
          </div>

          {/* Submit Button */}
          <button className="h-[53px] px-8 bg-[#6125d8] rounded-[8px] hover:bg-[#7a3ef0] transition-colors">
            <span className="font-inter font-medium text-[20px] text-white">
              Join Waitlist
            </span>
          </button>
        </div>

        {/* Helper Text */}
        <p className="font-inter font-normal text-[14px] text-[#6125d8]/70 tracking-[-0.42px] mt-4 max-w-[641px]">
          We'll email you as soon as the waitlist opens. Automated messaging
          service coming soon.
        </p>
      </div>
    </section>
  );
}
