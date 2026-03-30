import Link from "next/link";
import BookDemoForm from "./BookDemoForm";

export const metadata = {
  title: "Book a Demo | Ninad AI",
  description: "Schedule a demo of Ninad AI Voice.",
};

export default function BookDemoPage() {
  return (
    <main className="relative min-h-screen w-full bg-black overflow-hidden">
      <section className="relative w-full min-h-screen pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-20 flex items-center justify-center">
        {/* Background glows to match homepage */}
        <div className="absolute inset-0 pointer-events-none opacity-50 overflow-hidden">
          <div className="absolute left-[-30vw] top-[-18vw] h-[clamp(280px,62vw,780px)] w-[clamp(280px,60vw,760px)] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(97,37,216,0.65)_0%,transparent_70%)]" />
          <div className="absolute right-[-28vw] top-[4vw] h-[clamp(250px,52vw,650px)] w-[clamp(260px,54vw,670px)] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(59,130,246,0.55)_0%,transparent_70%)]" />
          <div className="absolute bottom-[-14vw] left-[-42vw] h-[clamp(220px,38vw,460px)] w-[clamp(380px,78vw,900px)] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(147,51,234,0.55)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-6xl -translate-y-2 sm:-translate-y-4 md:-translate-y-6 lg:-translate-y-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-14 items-center">
              <div className="max-w-2xl mx-auto lg:mx-0 text-center lg:text-left">
                <p className="text-white/60 font-inter text-sm tracking-widest uppercase">
                  Book a demo
                </p>
                <h1 className="mt-3 font-sans font-extrabold text-[clamp(40px,6vw,64px)] uppercase leading-[0.95] tracking-tight bg-gradient-to-b from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent">
                  See Ninad AI Voice in action
                </h1>
                <p className="mt-5 text-white/70 font-roboto text-base md:text-lg leading-relaxed">
                  Tell us a bit about your use case and we’ll reach out to schedule a live demo.
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <Link
                    href="/#waitlist"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-full bg-white text-black font-sans font-bold text-sm hover:bg-gray-200 transition-colors"
                  >
                    Join waitlist
                  </Link>
                </div>
              </div>

              <div className="w-full max-w-2xl mx-auto lg:mx-0 lg:max-w-none lg:pt-2">
                <BookDemoForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
