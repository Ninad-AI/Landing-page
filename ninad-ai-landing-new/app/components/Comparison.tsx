import Image from "next/image";

interface VoiceCardProps {
  title: string;
  subtitle: string;
  variant: "original" | "ninad" | "market";
  playButton: string;
}

function VoiceCard({ title, subtitle, variant, playButton }: VoiceCardProps) {
  const isNinad = variant === "ninad";

  return (
    <div
      className={`relative rounded-[20px] backdrop-blur-[2px] ${
        isNinad
          ? "w-[375px] h-[477px]"
          : "w-[360px] h-[450px]"
      }`}
      style={{
        background: isNinad 
          ? '#e0ebf6'
          : '#e0ebf6',
      }}
    >
      {/* Visual area with gradient background */}
      <div
        className={`relative mx-auto rounded-[15px] overflow-hidden bg-white border-2 border-white opacity-75 ${
          isNinad
            ? "w-[361px] h-[364px] mt-[25px] mx-[7px]"
            : "w-[340px] h-[327px] mt-[10px] mx-[10px]"
        }`}
      >
        {/* Decorative gradient elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Purple/Blue gradient shapes */}
          <div
            className={`absolute w-[780px] h-[260px] rounded-full blur-[60px] ${
              variant === "market"
                ? "bg-[#1758ff]/30"
                : variant === "ninad"
                ? "bg-[#6125d8]/40"
                : "bg-gradient-to-r from-[#6125d8]/30 to-[#00a9ff]/30"
            } -bottom-[400px] -left-[100px] rotate-[92deg]`}
          />
          <div
            className={`absolute w-[848px] h-[412px] rounded-full blur-[80px] ${
              variant === "market"
                ? "bg-[#1758ff]/20"
                : variant === "ninad"
                ? "bg-[#6125d8]/30"
                : "bg-gradient-to-r from-[#6125d8]/20 to-[#00a9ff]/20"
            } -bottom-[500px] -left-[150px] rotate-[105deg]`}
          />
          <div
            className={`absolute w-[682px] h-[363px] rounded-full blur-[50px] ${
              variant === "market"
                ? "bg-[#1758ff]/25"
                : variant === "ninad"
                ? "bg-[#6125d8]/35"
                : "bg-gradient-to-r from-[#6125d8]/25 to-[#00a9ff]/25"
            } -bottom-[200px] left-[7px] rotate-[93deg]`}
          />
        </div>

        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.08] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')] bg-repeat" />
      </div>

      {/* Play Button */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 ${
          isNinad ? "w-[105px] h-[104px]" : "w-[89px] h-[88px]"
        }`}
        style={{
          top: isNinad ? 'calc(25% + 20px)' : 'calc(30% + 10px)'
        }}
      >
        <Image
          src={playButton}
          alt="Play"
          fill
          className="object-contain"
        />
      </div>

      {/* Labels */}
      <div className={`absolute left-1/2 -translate-x-1/2 text-center w-full ${
        isNinad ? "bottom-10" : "bottom-8"
      }`}>
        {isNinad && (
          <div className="relative w-[205px] h-[50px] mb-2 mx-auto">
            <Image
              src="/assets/ninad-ai.png"
              alt="Ninad AI"
              fill
              className="object-contain"
            />
          </div>
        )}
        {title && (
          <p className="font-inter font-extrabold text-[40px] leading-none text-[rgba(0,165,255,0.77)]">
            {title}
          </p>
        )}
        <p className={`font-inter font-extrabold text-[40px] leading-none text-[#19182d] opacity-[0.63] ${title ? "mt-1" : ""}`}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export default function Comparison() {
  return (
    <section className="relative py-32 overflow-hidden min-h-screen flex items-center">
      {/* Background lines.svg */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Background glow effects */}
      <div className="absolute inset-0 z-[1]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2746px] h-[1746px] -mt-[251px]">
          {/* Purple glow */}
          <div className="absolute w-[800px] h-[800px] bg-[#6125d8] rounded-full blur-[200px] opacity-20 top-[200px] left-[400px]" />
          {/* Blue glow */}
          <div className="absolute w-[600px] h-[600px] bg-[#00a9ff] rounded-full blur-[180px] opacity-15 top-[400px] right-[300px]" />
        </div>
      </div>

      {/* Content */}
      <div className="relative max-w-[1600px] mx-auto px-8 z-10">
        {/* Section Title */}
        <h2 
          className="font-inter font-extrabold text-[75px] leading-[0.97] tracking-[-2.25px] text-center mb-4 bg-clip-text"
          style={{ 
            WebkitTextFillColor: "transparent", 
            backgroundImage: "linear-gradient(181deg, rgb(255, 255, 255) 10%, rgb(162, 160, 217) 91%)",
            textShadow: "5px 4px 45px rgba(255, 249, 249, 0.15)"
          }}
        >
          VOICE COMPARISON
        </h2>

        {/* Subtitle */}
        <p className="font-inter font-light text-[20px] text-[#e3e3e3] text-center tracking-[-0.6px] mb-8 max-w-[700px] mx-auto">
          Listen to the difference. Our AI captures the soul of the original voice.
        </p>

        {/* Voice Cards */}
        <div className="flex items-end justify-center gap-8">
          {/* Original Voice */}
          <VoiceCard
            title="ORIGINAL"
            subtitle="VOICE"
            variant="original"
            playButton="/assets/play-button-grayscale.png"
          />

          {/* Ninad AI */}
          <VoiceCard
            title=""
            subtitle="CLONE"
            variant="ninad"
            playButton="/assets/play-button-coloured.png"
          />

          {/* Market Clone */}
          <VoiceCard
            title="MARKET"
            subtitle="CLONE"
            variant="market"
            playButton="/assets/play-button-grayscale.png"
          />
        </div>
      </div>
    </section>
  );
}
