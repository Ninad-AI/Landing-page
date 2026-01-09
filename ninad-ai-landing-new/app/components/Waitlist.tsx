export default function Waitlist() {
  return (
    <section id="waitlist" className="relative w-full py-24 md:py-32 overflow-hidden bg-black flex items-center justify-center">
      
      {/* Background Effects */}
      <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Content Container */}
      <div className="relative container mx-auto px-6 md:px-12 lg:px-20 max-w-[1400px] flex flex-col items-center justify-center text-center gap-10 z-10">
        
        {/* Title */}
        <div className="space-y-4">
          <h2 className="font-sans font-extrabold text-4xl md:text-5xl lg:text-7xl leading-tight text-white tracking-tight">
            JOIN THE WAITLIST
          </h2>
          <p className="font-roboto text-lg md:text-xl text-white/60 max-w-2xl mx-auto">
            Experience the future of conversational AI. Be the first to access our platform.
          </p>
        </div>

        {/* Form */}
        <div className="w-full max-w-xl">
          <form className="flex flex-col md:flex-row items-center gap-4 w-full">
            {/* Email Input */}
            <div className="relative w-full md:flex-1 group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent-blue rounded-full p-[1px] opacity-50 group-hover:opacity-100 transition-opacity" />
                <input
                type="email"
                placeholder="Enter your email address"
                className="relative w-full h-[56px] px-6 bg-black rounded-full font-roboto text-base text-white placeholder:text-white/40 outline-none focus:bg-white/5 transition-all"
                required
                />
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              className="w-full md:w-auto h-[56px] px-8 bg-white text-black rounded-full font-sans font-bold text-base hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)] whitespace-nowrap"
            >
              Get Early Access
            </button>
          </form>

          {/* Helper Text */}
          <p className="mt-4 font-roboto text-sm text-white/40">
            No spam. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
