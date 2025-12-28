const imgTextLogo = "http://localhost:3845/assets/94af96374666fd48f952daeb646347d94b4803d6.png";

export default function Header() {
  return (
    <header className="fixed top-[30px] left-1/2 -translate-x-1/2 w-[min(1170px,calc(100vw-110px))] h-[83px] z-50 max-w-[1920px]">
      {/* Glass background */}
      <div className="absolute inset-0 backdrop-blur-[31.95px] bg-white rounded-[50px] shadow-[0px_4px_24px_0px_rgba(0,0,0,0.08)]" />

      {/* Logo */}
      <div className="absolute h-[34px] left-[26px] top-[calc(50%-17px)] w-[153px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="Ninad AI" className="absolute h-[104.03%] left-0 max-w-none top-[-2.01%] w-[91.26%]" src={imgTextLogo} />
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute flex font-['Inter'] font-bold gap-[clamp(15px,1.7vw,20px)] h-[20px] items-center leading-none left-1/2 -translate-x-1/2 text-[clamp(16px,1.4vw,20px)] text-black text-center top-[calc(50%-10px)]">
        <p className="h-[20px] whitespace-nowrap">
          PRODUCTS
        </p>
        <p className="h-[20px] whitespace-nowrap">
          USE CASES
        </p>
        <p className="h-[20px] whitespace-nowrap">
          KNOW MORE
        </p>
      </div>

      {/* CTA Button */}
      <div className="absolute h-[45.476px] right-[26px] top-[calc(50%-22.738px)] w-[clamp(110px,8.9vw,127.529px)]">
        <div className="absolute bg-white border border-[#6125d8] border-solid inset-0 opacity-[0.81] rounded-[31px] shadow-[0px_0px_31.1px_2px_rgba(97,37,216,0.39)]" />
        <div className="absolute flex flex-col font-['Inter'] font-extrabold inset-[35.18%_8.26%_34.03%_8.63%] justify-center leading-[0] text-[#6125d8] text-[clamp(13px,1vw,15px)] text-center">
          <p className="leading-none">BOOK DEMO</p>
        </div>
      </div>
    </header>
  );
}
