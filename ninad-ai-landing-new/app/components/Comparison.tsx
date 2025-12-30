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
      className={`relative rounded-[22px] backdrop-blur-[2px] border border-[#2a1f5c] ${
        isNinad
          ? "w-[420px] h-[545px] border-white/40"
          : "w-[400px] h-[510px]"
      }`}
      style={{
        background: 'linear-gradient(180deg, rgba(51, 20, 114, 0.41) 0%, rgba(55, 109, 249, 0.2) 100%)',
      }}
    >
      {/* Visual area with gradient background */}
      <div
        className={`relative mx-auto rounded-[16px] overflow-hidden bg-white border-2 border-white opacity-75 ${
          isNinad
            ? "w-[398px] h-[380px] mt-5"
            : "w-[380px] h-[340px] mt-5"
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
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
          isNinad ? "w-[140px] h-[140px]" : "w-[125px] h-[125px]"
        }`}
        style={{
          top: isNinad ? 'calc(5px + 190px)' : 'calc(20px + 170px)'
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
        isNinad ? "bottom-8" : "bottom-7"
      }`}>
        {isNinad && (
          <div className="relative w-[200px] h-[48px] mb-2 mx-auto">
            <Image
              src="/assets/ninad-ai.png"
              alt="Ninad AI"
              fill
              className="object-contain"
            />
          </div>
        )}
        {title && (
          <p className="font-inter font-extrabold text-[36px] leading-none text-white">
            {title}
          </p>
        )}
        <p className={`font-inter font-extrabold text-[36px] leading-none text-[#8e8b95] opacity-60 ${title ? "mt-1" : ""}`}>
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
          backgroundImage: "url('assets/lines.svg')",
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
      <div className="relative max-w-[1600px] mx-auto px-8">
        {/* Section Title */}
        <h2 className="font-inter font-extrabold text-[130px] leading-[0.97] tracking-[-3.9px] text-center mb-10 gradient-text bg-gradient-to-b from-white from-[10%] to-[#98dbff] to-[91%]">
          COMPARISON
        </h2>

        {/* Voice Cloning CTA */}
        <div className="flex justify-center mb-18">
          <button className="h-[62px] px-10 bg-[#e9f8ff] border border-[#00a9fe] rounded-[33px] shadow-[0px_2px_80px_10px_rgba(255,254,254,0.28)]">
            <span className="font-inter font-extrabold text-[19px] text-[#00a9ff]">
              VOICE CLONING
            </span>
          </button>
        </div>

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
