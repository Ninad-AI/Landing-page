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
    <section id="products" className="relative py-20 md:py-32 overflow-hidden bg-black min-h-screen flex items-center">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative container mx-auto px-6 max-w-7xl">
        {/* Section Title */}
        <h2 
          className="
            font-sans font-black 
            text-4xl md:text-6xl lg:text-[110px] 
            leading-none tracking-tight 
            text-center mb-4 
            bg-clip-text text-transparent 
            bg-gradient-to-b from-white to-white/40
          "
        >
          PRODUCTS
        </h2>

        {/* Subtitle */}
        <div className="font-sans font-medium text-lg md:text-xl text-center text-muted tracking-tight mb-16 md:mb-24 max-w-3xl mx-auto uppercase">
          <p className="mb-1">Experience expressive, adaptable, and high-fidelity voice technology</p>
          <p>built for real-world impact.</p>
        </div>

        {/* Products Layout */}
        <div className="flex flex-col lg:flex-row relative" ref={containerRef}>
          {/* Product List - Left Side */}
          <div className="flex-shrink-0 w-full lg:w-[450px] relative mb-12 lg:mb-0">
            {products.map((product, index) => (
              <div key={index} className="relative">
                {/* Divider Line Above (skip first) */}
                {index !== 0 && <div className="w-full h-[1px] bg-gradient-to-r from-white/20 to-primary/20" />}
                
                {/* Product Item */}
                <button
                  ref={(el) => { productRefs.current[index] = el; }}
                  onClick={() => handleProductClick(index)}
                  className={`
                    w-full text-left py-4 md:py-6 group
                    transition-all duration-300 cursor-pointer 
                    ${activeProduct === index ? 'opacity-100 pl-4' : 'opacity-50 hover:opacity-80 hover:pl-2'}
                  `}
                >
                  <h3 className={`
                    font-sans font-bold text-2xl md:text-4xl leading-none uppercase transition-colors
                    ${activeProduct === index ? 'text-white' : 'text-white/60 group-hover:text-white/80'}
                  `}>
                    {product.name}
                  </h3>
                </button>
              </div>
            ))}
            
            {/* Bottom divider */}
            <div className="w-full h-[1px] bg-gradient-to-r from-white/20 to-primary/20" />
          </div>

          {/* Animated Line (Desktop only) */}
          <div 
            className="hidden lg:block absolute left-0 w-full h-[2px] bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-500 ease-out pointer-events-none z-10"
            style={{ 
              top: `${linePosition}px`,
            }}
          />

          {/* Product Description - Right Side */}
          <div className="flex-1 lg:pl-20 relative min-h-[300px] lg:min-h-[500px]">
             <div 
                className={`
                    transition-all duration-500 ease-out
                    ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
                `}
                style={{
                     marginTop: '2rem'
                }}
             >
                <h4 className="font-sans font-medium text-primary text-sm uppercase tracking-widest mb-4 hidden lg:block">
                    Description
                </h4>

                <p className="font-roboto text-xl md:text-2xl lg:text-3xl leading-relaxed text-white/90">
                  {products[activeProduct].description}
                </p>

                {products[activeProduct].descriptionPart2 && (
                    <p className="font-roboto text-xl md:text-2xl lg:text-3xl leading-relaxed text-white/90 mt-6 lg:mt-12 pl-0 lg:pl-12 border-l-2 border-primary/30">
                        {products[activeProduct].descriptionPart2}
                    </p>
                )}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
