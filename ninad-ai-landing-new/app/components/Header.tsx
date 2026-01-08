const imgTextLogo = "/assets/ninad-ai.png";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-[90px] z-50 flex items-center">
      {/* Glass background */}
      <div className="absolute inset-0 backdrop-blur-[31.95px] bg-white/90 border-b border-gray-100 pointer-events-none" />

      <div className="relative w-full flex items-center px-[40px] md:px-[80px]">
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

        {/* Spacer to push items to the right */}
        <div className="flex-1" />

        {/* Nav + CTA Group */}
        <div className="flex items-center gap-[45px]">
          {/* Navigation */}
          <nav className="flex items-center font-['Inter'] font-bold gap-[35px] text-[16px] text-black">
            <a href="#products" className="whitespace-nowrap hover:text-[#6125d8] transition-colors">
              PRODUCTS
            </a>
            <a href="#use-cases" className="whitespace-nowrap hover:text-[#6125d8] transition-colors">
              USE CASES
            </a>
            <a href="#features" className="whitespace-nowrap hover:text-[#6125d8] transition-colors">
              KNOW MORE
            </a>
          </nav>

          {/* CTA Button */}
          <a
            href="#waitlist"
            aria-label="Book demo"
            className="relative h-[48px] w-[145px] flex-shrink-0 group"
          >
            <span className="absolute inset-0 bg-white group-hover:bg-[#6125d8] border-2 border-[#6125d8] rounded-[31px] shadow-[0px_0px_20px_0px_rgba(97,37,216,0.2)] transition-all duration-300" />
            <span className="absolute inset-0 flex items-center justify-center font-['Inter'] font-extrabold text-[#6125d8] group-hover:text-white text-[15px] transition-colors duration-300">
              BOOK DEMO
            </span>
          </a>
        </div>
      </div>
    </header>
  );
}
