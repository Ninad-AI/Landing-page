import Image from "next/image";

const navItems = ["PRODUCTS", "USE CASES", "KNOW MORE"];

export default function Header() {
  return (
    <header className="absolute top-[30px] left-1/2 -translate-x-1/2 w-[1170px] h-[83px] z-50">
      {/* Glass background */}
      <div className="absolute inset-0 backdrop-blur-[32px] bg-white/80 rounded-[50px]" />

      {/* Content */}
      <div className="relative h-full flex items-center justify-between px-8">
        {/* Logo */}
        <div className="relative w-[153px] h-[34px]">
          <Image
            src="/assets/ninad-ai.png"
            alt="Ninad AI"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-5">
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="font-inter font-bold text-[20px] text-black hover:text-[#6125d8] transition-colors"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA Button */}
        <button className="relative h-[45px] px-6 bg-white border border-[#6125d8] rounded-[31px] shadow-[0px_0px_31px_2px_rgba(97,37,216,0.39)] opacity-90 hover:opacity-100 transition-opacity btn-primary">
          <span className="font-inter font-extrabold text-[15px] text-[#6125d8]">
            BOOK DEMO
          </span>
        </button>
      </div>
    </header>
  );
}
