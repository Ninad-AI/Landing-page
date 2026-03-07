import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative bg-black w-full border-t border-white/10">
      {/* Main Footer Section */}
      <div className="w-full py-12 px-6 md:px-12 lg:px-20">
        <div className="container mx-auto max-w-[1600px]">
          {/* Main Footer Content */}
          <div className="flex flex-col items-center md:items-start mb-12">
            {/* Logo and Description */}
            <div className="space-y-6 flex flex-col items-center md:items-start text-center md:text-left">
              {/* Logo */}
              <div className="relative w-36 h-9">
                <Image
                  src="/assets/ninad-ai.png"
                  alt="Ninad AI"
                  fill
                  className="object-contain object-left"
                />
              </div>

              {/* Description */}
              <p className="font-roboto font-normal text-sm text-foreground/80 leading-relaxed max-w-xs">
                Low-latency, expressive speech for apps, agents, and experiences
                ready to integrate in minutes.
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/10 mb-8" />

          {/* Bottom Footer Section */}
          <div className="flex justify-center md:justify-start items-center">
            <div className="text-sm text-muted font-roboto">
              © 2025 Ninad AI. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

