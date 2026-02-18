import Link from "next/link";
import BookDemoForm from "./BookDemoForm";

export const metadata = {
  title: "Book a Demo | Ninad AI",
  description: "Schedule a demo of Ninad AI Voice.",
};

export default function BookDemoPage() {
  return (
    <main className="relative min-h-screen w-full lg:h-screen lg:overflow-hidden bg-black">
      <section className="relative w-full min-h-screen lg:h-full pt-28 md:pt-32 pb-20 lg:pb-0 flex items-center justify-center">
        {/* Background glows to match homepage */}
        <div className="absolute inset-0 pointer-events-none opacity-50 overflow-hidden">
          <div className="absolute h-[780px] w-[760px] left-[-260px] top-[-220px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(97,37,216,0.65)_0%,transparent_70%)]" />
          <div className="absolute h-[650px] w-[670px] right-[-240px] top-[60px] rounded-full blur-[120px] bg-[radial-gradient(circle,rgba(59,130,246,0.55)_0%,transparent_70%)]" />
          <div className="absolute h-[460px] w-[900px] left-[-450px] bottom-[-140px] rounded-full blur-[140px] bg-[radial-gradient(circle,rgba(147,51,234,0.55)_0%,transparent_70%)]" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 lg:px-20">
          <div className="mx-auto w-full max-w-6xl -translate-y-4 md:-translate-y-6 lg:-translate-y-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
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
