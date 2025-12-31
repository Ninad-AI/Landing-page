'use client';

import { useState, useRef, useEffect } from 'react';

interface Product {
  name: string;
  description: string;
  descriptionPart2?: string;
  descriptionPosition?: 'below' | 'above' | 'split';
}

const products: Product[] = [
  {
    name: "Expressive TTS",
    description: "Our Expressive Text-to-Speech brings writing to life with depth and rhythm. Unlike standard TTS, Ninad voices adjust intonation, energy, and sentiment - perfect for audiobooks, podcasts, assistants, and learning platforms that demand authentic emotion."
  },
  {
    name: "Voice Cloning",
    description: "We don't just copy your voice, we replicate your identity. Ninad's voice cloning captures tone, style, and emotional nuance, creating voices that sound genuinely human. Perfect for content creation, assistants, and brand storytelling."
  },
  {
    name: "Conversation AI",
    description: "Forget robotic chatbots. Our Conversational AI listens, reacts, and speaks with natural flow.",
    descriptionPart2: "It understands tone, timing, and context, making it ideal for customer support, virtual agents, and voice companions that actually feel alive.",
    descriptionPosition: 'split'
  },
  {
    name: "Live Speech Translation",
    description: "Real-time translation that speaks like a human, not a machine. Our system maintains context, emotion, and flow, allowing seamless multilingual interactions in meetings, events, or live broadcasts.",
    descriptionPosition: 'above'
  },
  {
    name: "Speech Intelligence",
    description: "The next evolution of voice understanding. Speech Intelligence goes beyond words — detecting intent, emotion, and behavioral cues to help robots, IoT systems, and devices truly listen and respond with understanding.",
    descriptionPosition: 'above'
  }
];

export default function Products() {
  const [activeProduct, setActiveProduct] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [linePosition, setLinePosition] = useState(0);
  const productRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Calculate line position based on active product
    if (productRefs.current[activeProduct] && containerRef.current) {
      const button = productRefs.current[activeProduct];
      const container = containerRef.current;
      if (button) {
        const buttonRect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        // Position line at the bottom of the active product
        setLinePosition(buttonRect.bottom - containerRect.top);
      }
    }
  }, [activeProduct]);

  const handleProductClick = (index: number) => {
    if (index !== activeProduct) {
      setIsTransitioning(true);
      setActiveProduct(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  };

  return (
    <section id="products" className="relative py-20 overflow-hidden bg-black">
      {/* Content */}
      <div className="relative max-w-[1600px] mx-auto px-8">
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

        {/* Products Layout */}
        <div className="flex relative" ref={containerRef}>
          {/* Product List - Left Side */}
          <div className="flex-shrink-0 w-[420px] relative">
            {products.map((product, index) => (
              <div key={index} className="relative">
                {/* Divider Line Above (skip first) */}
                {index !== 0 && <div className="w-full h-[2px] bg-gradient-to-r from-white/30 to-[#6125d8]/30" />}
                
                {/* Product Item */}
                <button
                  ref={(el) => { productRefs.current[index] = el; }}
                  onClick={() => handleProductClick(index)}
                  className={`w-full text-left py-3 transition-opacity duration-300 cursor-pointer ${
                    activeProduct === index ? 'opacity-100' : 'opacity-50'
                  } hover:opacity-100`}
                >
                  <h3 className="font-inter font-bold text-[36px] leading-none tracking-[-1.2px] text-white uppercase">
                    {product.name}
                  </h3>
                </button>
              </div>
            ))}
            
            {/* Bottom divider */}
            <div className="w-full h-[2px] bg-gradient-to-r from-white/30 to-[#6125d8]/30" />
          </div>

          {/* Animated Line */}
          <div 
            className="absolute left-0 w-full h-[2px] bg-white transition-all duration-500 ease-out pointer-events-none z-10"
            style={{ 
              top: `${linePosition}px`,
            }}
          />

          {/* Product Description - Right Side */}
          <div className="flex-1 pl-16 relative min-h-[500px]">
            {/* For "below" position - text starts below the line */}
            {!products[activeProduct].descriptionPosition && (
              <div 
                className="absolute left-16 right-0 transition-all duration-500 ease-out"
                style={{ 
                  top: `${linePosition + 16}px`
                }}
              >
                <p className={`font-mono text-[30px] leading-[1.12] text-[#fffbfb] transition-opacity duration-300 ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}>
                  {products[activeProduct].description}
                </p>
              </div>
            )}

            {/* For "split" position - half above, half below */}
            {products[activeProduct].descriptionPosition === 'split' && (
              <>
                <div 
                  className="absolute left-16 right-0 transition-all duration-500 ease-out"
                  style={{ 
                    bottom: `calc(100% - ${linePosition}px + 16px)`
                  }}
                >
                  <p className={`font-mono text-[30px] leading-[1.12] text-[#fffbfb] transition-opacity duration-300 ${
                    isTransitioning ? 'opacity-0' : 'opacity-100'
                  }`}>
                    {products[activeProduct].description}
                  </p>
                </div>
                <div 
                  className="absolute left-16 right-0 transition-all duration-500 ease-out"
                  style={{ 
                    top: `${linePosition + 16}px`
                  }}
                >
                  <p className={`font-mono text-[30px] leading-[1.12] text-[#fffbfb] transition-opacity duration-300 ${
                    isTransitioning ? 'opacity-0' : 'opacity-100'
                  }`}>
                    {products[activeProduct].descriptionPart2}
                  </p>
                </div>
              </>
            )}

            {/* For "above" position - text ends at the line */}
            {products[activeProduct].descriptionPosition === 'above' && (
              <>
                <div 
                  className="absolute left-16 right-0 transition-all duration-500 ease-out"
                  style={{ 
                    bottom: `calc(100% - ${linePosition}px + 16px)`
                  }}
                >
                  <p className={`font-mono text-[30px] leading-[1.12] text-[#fffbfb] transition-opacity duration-300 mb-8 ${
                    isTransitioning ? 'opacity-0' : 'opacity-100'
                  }`}>
                    {products[activeProduct].description}
                  </p>
                  
                  {/* Coming Soon Badge - Only for Speech Intelligence */}
                  {activeProduct === 4 && (
                    <div className={`text-right transition-opacity duration-300 ${
                      isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}>
                      <span className="text-white text-[20px] tracking-[-0.6px]">
                        COMING SOON
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
