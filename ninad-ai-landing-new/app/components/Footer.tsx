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

// SVG Icons for social media
const SocialIcon = ({ name }: { name: string }) => {
  switch (name) {
    case "Facebook":
      return (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case "GitLab":
      return (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
            <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.15-1.15l2.25-3.86a.85.85 0 0 1 1.05-.3l2.25 1.28L8.6 4.7a.85.85 0 0 1 1.55 0l1.85 5.66 1.85-5.66a.85.85 0 0 1 1.55 0l1.85 5.66 2.25-1.28a.85.85 0 0 1 1.05.3l2.25 3.86a.84.84 0 0 1-.15 1.15z"/>
        </svg>
      );
    case "GitHub":
        return (
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
        );
    case "Telegram":
        return (
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
        );
    case "Instagram":
      return (
        <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case "Figma":
        return (
            <svg fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M12 24c0-3.314-2.686-6-6-6s-6 2.686-6 6c0-3.314 2.686-6 6-6s6 2.686 6 6zm0-12c3.314 0 6-2.686 6-6s-2.686-6-6-6-6 2.686-6 6 2.686 6 6 6zm0 0c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm6 0c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-2.686-6-6-6z"/>
            </svg>
        );
    default:
      return null;
  }
};

const socialIcons = [
  "Facebook",
  "GitLab",
  "GitHub",
  "Telegram",
  "Instagram",
  "Figma",
];

export default function Footer() {
  return (
    <footer className="relative bg-black w-full border-t border-white/10">
      {/* Main Footer Section */}
      <div className="w-full py-20 px-6 md:px-12 lg:px-20">
        <div className="container mx-auto max-w-[1400px]">
          {/* Main Footer Content - Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
            {/* Logo and Description Column */}
            <div className="space-y-6">
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

            {/* Products Column */}
            <div>
              <h4 className="font-sans font-bold text-lg text-white mb-6">
                Products
              </h4>
              <ul className="space-y-3">
                {productLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="font-roboto font-normal text-sm text-muted hover:text-primary transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="font-sans font-bold text-lg text-white mb-6">
                Company
              </h4>
              <ul className="space-y-3">
                {companyLinks.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="font-roboto font-normal text-sm text-muted hover:text-primary transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Follow Us Column */}
            <div>
              <h4 className="font-sans font-bold text-lg text-white mb-6">
                Follow us
              </h4>
              <div className="flex gap-4 flex-wrap">
                {socialIcons.map((iconName, index) => (
                  <a
                    key={index}
                    href="#"
                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-primary hover:border-primary transition-all duration-300"
                    aria-label={iconName}
                  >
                   <SocialIcon name={iconName} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/10 mb-8" />

          {/* Bottom Footer Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-muted font-roboto">
              © 2024 Ninad AI. All rights reserved.
            </div>

            <div className="flex flex-wrap justify-center gap-6">
              {legalLinks.map((link, index) => (
                <a
                  key={index}
                  href="#"
                  className="font-roboto text-sm text-muted hover:text-primary transition-colors duration-200"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
