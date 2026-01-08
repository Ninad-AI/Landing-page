import Image from "next/image";

const productLinks = [
  "Expressive TTS",
  "Voice Cloning",
  "Conversational AI",
  "Live Speech Translation",
  "Speech Intelligence",
];

const companyLinks = ["About Us", "Careers", "FAQs", "Teams", "Contact Us"];

const legalLinks = [
  "Privacy Policy",
  "Terms of Use",
  "Sales and Refunds",
  "Legal",
  "Site Map",
];

const socialIcons = [
  { name: "Facebook", src: "/assets/socialmedia-logos/facebook.png" },
  { name: "GitLab", src: "/assets/socialmedia-logos/gitlab.png" },
  { name: "GitHub", src: "/assets/socialmedia-logos/github.png" },
  { name: "Telegram", src: "/assets/socialmedia-logos/telegram.png" },
  { name: "Instagram", src: "/assets/socialmedia-logos/instagram.png" },
  { name: "Figma", src: "/assets/socialmedia-logos/figma.png" },
];

export default function Footer() {
  return (
    <footer className="relative">
      {/* Main Footer Section - Black Background */}
      <div className="bg-black py-16">
        <div className="relative w-[min(1170px,calc(100vw-110px))] mx-auto">
          {/* Main Footer Content - Grid Layout */}
          <div className="grid grid-cols-[298px_132px_133px_1fr] gap-x-20">
            {/* Logo and Description Column */}
            <div>
              {/* Logo */}
              <div className="relative w-38 h-8.5 mb-6">
                <Image
                  src="/assets/ninad-ai.png"
                  alt="Ninad AI"
                  fill
                  className="object-contain object-left"
                />
              </div>

              {/* Description */}
              <p className="font-roboto font-normal text-sm text-white leading-normal">
                Low-latency, expressive speech for apps, agents, and experiences
                ready to integrate in minutes.
              </p>
            </div>

            {/* Products Column */}
            <div>
              <h4 className="font-roboto font-bold text-xl text-white mb-6">
                Products
              </h4>
              <ul className="space-y-3">
                {productLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="font-roboto font-normal text-sm text-white hover:text-[#6125d8] transition-colors whitespace-nowrap"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-roboto font-bold text-xl text-white mb-6">
                Company
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="font-roboto font-normal text-sm text-white hover:text-[#6125d8] transition-colors whitespace-nowrap"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Follow Us Column */}
            <div>
              <h4 className="font-roboto font-bold text-xl text-white mb-6">
                Follow us
              </h4>
              <div className="flex gap-4">
                {socialIcons.map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-6 h-6 relative hover:opacity-80 transition-opacity flex items-center justify-center"
                  >
                    <Image
                      src={social.src}
                      alt={social.name}
                      width={social.name === "Facebook" ? 12 : 22}
                      height={social.name === "Facebook" ? 22 : 22}
                      className="object-contain"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Gradient Background */}
      <div 
        className="h-14 relative"
        style={{
          background: 'linear-gradient(90deg, rgba(97, 37, 216, 0.6) 0%, rgba(0, 169, 255, 0.4) 50%, rgba(97, 37, 216, 0.6) 100%)',
        }}
      >
        <div className="relative w-[min(1170px,calc(100vw-110px))] mx-auto h-full flex items-center justify-between">
          {/* Copyright */}
          <p className="font-roboto font-light text-xs text-white">
            © 2021 All Rights Reserved
          </p>

          {/* Legal Links */}
          <div className="flex gap-10">
            {legalLinks.map((link, index) => (
              <a
                key={index}
                href="#"
                className="font-roboto font-normal text-sm text-white/80 hover:text-white transition-colors whitespace-nowrap"
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
