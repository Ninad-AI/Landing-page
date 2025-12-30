const productItems = [
  { name: "Expressive TTS", active: true },
  { name: "Voice Cloning", active: false },
  { name: "Conversation AI", active: false },
  { name: "Live Speech Translation", active: false },
  { name: "Speech Intelligence", active: false },
];

export default function Products() {
  return (
    <section id="products" className="relative py-20 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
        <div className="absolute w-[800px] h-[800px] bg-[#6125d8] rounded-full blur-[250px] opacity-15 top-[100px] left-[200px]" />
      </div>

      {/* Content */}
      <div className="relative max-w-[1280px] mx-auto px-8">
        {/* Section Title */}
        <h2 className="font-inter font-black text-[110px] leading-none tracking-[-3.3px] text-center mb-4 gradient-text bg-gradient-to-b from-white from-[17%] to-[#999] to-[109%]">
          PRODUCTS
        </h2>

        {/* Subtitle */}
        <p className="font-inter font-light text-[20px] text-center text-[#f9f1ff] tracking-[-0.6px] mb-16 max-w-[700px] mx-auto">
          Experience expressive, adaptable, and high-fidelity voice technology
          <br />
          built for real-world impact.
        </p>

        {/* Divider lines */}
        <div className="w-[500px] h-[2px] bg-gradient-to-r from-white/60 to-[#6125d8]/60 mb-4" />

        {/* Products Layout */}
        <div className="flex gap-16">
          {/* Product List */}
          <div className="flex-shrink-0 w-[500px]">
            {productItems.map((item, index) => (
              <div key={index}>
                {/* Divider */}
                <div className="w-full h-[2px] bg-gradient-to-r from-white/30 to-[#6125d8]/30" />

                {/* Product Item */}
                <div
                  className={`py-4 ${
                    item.active ? "" : "opacity-50"
                  }`}
                >
                  <h3
                    className={`font-inter font-bold text-[40px] leading-none tracking-[-1.2px] uppercase ${
                      item.active ? "text-white" : "text-white"
                    }`}
                  >
                    {item.name}
                  </h3>
                </div>
              </div>
            ))}
            {/* Final divider */}
            <div className="w-full h-[2px] bg-gradient-to-r from-white/30 to-[#6125d8]/30" />
          </div>

          {/* Product Description */}
          <div className="flex-1 pt-8">
            <p className="font-anonymous text-[30px] leading-[1.12] text-[#fffbfb]">
              Our Expressive Text-to-Speech brings writing to life with depth
              and rhythm. Unlike standard TTS, Ninad voices adjust intonation,
              energy, and sentiment - perfect for audiobooks, podcasts,
              assistants, and learning platforms that demand authentic emotion.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
