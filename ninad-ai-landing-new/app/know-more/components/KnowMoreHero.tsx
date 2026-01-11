"use client";

import Link from "next/link";
import Image from "next/image";

export default function KnowMoreHero() {
  return (
    <section className="relative pt-32 pb-0 overflow-hidden min-h-[90vh] flex flex-col items-center justify-between text-center">
      {/* Background Glow */}
      <div className="absolute top-0 left-[-20%] w-[80%] h-[80%] -z-10 opacity-60 blur-3xl">
        <div className="w-full h-full bg-linear-to-br from-primary/40 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto max-w-5xl z-10 px-6">
        <h1 className="font-sans font-semibold text-4xl sm:text-5xl md:text-[64px] text-white mb-6 leading-tight">
          Let your followers talk to you.
        </h1>
        
        <div className="max-w-4xl mx-auto mb-4">
          <p className="font-roboto text-lg md:text-2xl text-white/90 leading-relaxed">
            Turn your digital presence into conversations through one simple link in your bio.
          </p>
        </div>
        
        <p className="font-roboto text-lg md:text-2xl text-white/80 mb-10">
          Fans pay to chat. You stay in control. No upfront cost.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-4 rounded bg-[#6125d8] text-white font-roboto font-normal text-xl hover:bg-[#7a46f0] transition-colors"
          >
            See how it works
          </Link>
          <Link
            href="/book-demo"
            className="w-full sm:w-auto px-8 py-4 rounded bg-white text-[#6125d8] font-roboto font-normal text-xl hover:bg-gray-100 transition-colors"
          >
            Book A Demo
          </Link>
        </div>
      </div>

      {/* Hero Image - Extending from right to left */}
      <div className="mt-16 w-full relative h-[350px] md:h-[500px] lg:h-[650px] xl:h-[750px]">
        <Image
          src="/assets/know-more/knowmore-hero-img.png"
          alt="Hero Device"
          fill
          className="object-cover md:object-contain object-top"
          priority
        />
      </div>
    </section>
  );
}
