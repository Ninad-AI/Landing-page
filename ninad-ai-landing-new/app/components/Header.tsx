const imgTextLogo = "/assets/ninad-ai.png";

export default function Header() {
  return (
    <header className="fixed top-[30px] left-1/2 -translate-x-1/2 w-[min(1170px,calc(100vw-110px))] h-[83px] z-50 max-w-[1920px]">
      {/* Glass background */}
      <div className="absolute inset-0 backdrop-blur-[31.95px] bg-white rounded-[50px] pointer-events-none" />

      <div className="relative h-full flex items-center px-[26px]">
        {/* Logo */}
        <a href="#" aria-label="Home" className="h-[34px] w-[153px] flex-shrink-0">
          <div className="relative h-full w-full overflow-hidden pointer-events-none">
            <img
              alt="Ninad AI"
              src={imgTextLogo}
              className="absolute h-[104.03%] left-0 top-[-2.01%] w-[91.26%] max-w-none"
            />
          </div>
        </a>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Nav + CTA (RIGHT ALIGNED GROUP) */}
        <div className="flex items-center gap-[28px]">
          {/* Navigation */}
          <nav className="flex items-center font-['Inter'] font-bold gap-[20px] h-[20px] text-[18px] text-black">
            <a href="#products" className="whitespace-nowrap">
              PRODUCTS
            </a>
            <a href="#use-cases" className="whitespace-nowrap">
              USE CASES
            </a>
            <a href="#features" className="whitespace-nowrap">
              KNOW MORE
            </a>
          </nav>

          {/* CTA Button */}
          <a
            href="#waitlist"
            aria-label="Book demo"
            className="relative h-[45.476px] w-[127.529px] flex-shrink-0 group"
          >
            <span className="absolute inset-0 bg-white group-hover:bg-[#6125d8] border border-[#6125d8] rounded-[31px] opacity-[0.81] shadow-[0px_0px_31.1px_2px_rgba(97,37,216,0.39)] transition-colors duration-300" />
            <span className="absolute inset-0 flex items-center justify-center font-['Inter'] font-extrabold text-[#6125d8] group-hover:text-white text-[15px] transition-colors duration-300">
              BOOK DEMO
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
