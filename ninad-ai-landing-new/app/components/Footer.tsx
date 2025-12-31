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
  { name: "Facebook", src: "/assets/social/facebook.png" },
  { name: "GitLab", src: "/assets/social/gitlab.png" },
  { name: "GitHub", src: "/assets/social/github.png" },
  { name: "Telegram", src: "/assets/social/telegram.png" },
  { name: "Instagram", src: "/assets/social/instagram.png" },
  { name: "Figma", src: "/assets/social/figma.png" },
];

export default function Footer() {
  return (
    <footer className="relative pt-16 pb-8">
      {/* Content */}
      <div className="relative w-[min(1170px,calc(100vw-110px))] mx-auto">
        {/* Main Footer Content */}
        <div className="flex gap-16 mb-12">
          {/* Logo and Description */}
          <div className="max-w-[298px]">
            {/* Logo */}
            <div className="relative w-[153px] h-[34px] mb-4">
              <Image
                src="/assets/ninad-ai.png"
                alt="Ninad AI"
                fill
                className="object-contain"
              />
            </div>

            {/* Description */}
            <p className="font-roboto font-normal text-[14px] text-white leading-relaxed">
              Low-latency, expressive speech for apps, agents, and experiences
              ready to integrate in minutes.
            </p>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="font-roboto font-bold text-[20px] text-white mb-4">
              Products
            </h4>
            <ul className="space-y-2">
              {productLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="font-roboto font-normal text-[14px] text-white hover:text-[#6125d8] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="font-roboto font-bold text-[20px] text-white mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="font-roboto font-normal text-[14px] text-white hover:text-[#6125d8] transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="font-roboto font-bold text-[20px] text-white mb-4">
              Follow us
            </h4>
            <div className="flex gap-4">
              {socialIcons.map((social, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-[24px] h-[24px] relative hover:opacity-80 transition-opacity"
                >
                  <Image
                    src={social.src}
                    alt={social.name}
                    fill
                    className="object-contain"
                  />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-6 flex items-center justify-between">
          {/* Copyright */}
          <p className="font-roboto font-light text-[12px] text-white">
            © 2021 All Rights Reserved
          </p>

          {/* Legal Links */}
          <div className="flex gap-10">
            {legalLinks.map((link, index) => (
              <a
                key={index}
                href="#"
                className="font-roboto font-normal text-[14px] text-white/80 hover:text-white transition-colors"
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
