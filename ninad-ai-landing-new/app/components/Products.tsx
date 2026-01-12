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
    description: "Our Expressive Text-to-Speech brings writing to life with depth and rhythm. Unlike standard TTS, Ninad voices adjust intonation, energy, and sentiment - perfect for audiobooks, podcasts, assistants, and learning platforms that demand authentic emotion.",
    descriptionPosition: 'below'
  },
  {
    name: "Voice Cloning",
    description: "We don’t just copy your voice, we replicate your identity. Ninad captures tone, style, and emotional nuance to create voices that sound truly human, perfect for content, assistants, and brand storytelling.",
    descriptionPosition: 'below'
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
  const [listHeight, setListHeight] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const productRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePositions = () => {
      setIsDesktop(window.innerWidth >= 1024);
      
      // Calculate line position based on active product
      if (productRefs.current[activeProduct] && containerRef.current) {
        const button = productRefs.current[activeProduct];
        const container = containerRef.current;
        if (button) {
          const buttonRect = button.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          // Position line at the bottom of the active product for the split layout
          setLinePosition(buttonRect.bottom - containerRect.top);
        }
      }

      // Calculate total list height
      if (listRef.current) {
        setListHeight(listRef.current.offsetHeight);
      }
    };

    // Use requestAnimationFrame for smoother initial positioning
    const rafId = requestAnimationFrame(updatePositions);
    window.addEventListener('resize', updatePositions);
    return () => {
      window.removeEventListener('resize', updatePositions);
      cancelAnimationFrame(rafId);
    };
  }, [activeProduct]);

  const handleProductHover = (index: number) => {
    if (index !== activeProduct && !isTransitioning) {
      setIsTransitioning(true);
      
      // Wait for fade out before switching content
      setTimeout(() => {
        setActiveProduct(index);
        // Small delay to ensure state update is processed
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 150);
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
          <div ref={listRef} className="flex-shrink-0 w-full lg:w-[450px] relative mb-12 lg:mb-0">
            {products.map((product, index) => (
              <div key={index} className="relative">
                {/* Divider Line Above (skip first) */}
                {index !== 0 && <div className="w-full h-[1px] bg-gradient-to-r from-white/20 to-primary/20" />}
                
                {/* Product Item */}
                <button
                  ref={(el) => { productRefs.current[index] = el; }}
                  onClick={() => handleProductHover(index)}
                  className={`
                    w-full text-left py-4 md:py-6 group
                    transition-all duration-300 cursor-pointer 
                    ${activeProduct === index ? 'opacity-100 pl-4' : 'opacity-40 hover:opacity-70 hover:pl-2'}
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
            className="hidden lg:block absolute left-0 w-full h-[2px] bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none z-10"
            style={{ 
              transform: `translateY(${linePosition - 1}px)`,
              top: 0
            }}
          />

          {/* Product Description - Right Side */}
          <div 
            className="flex-1 lg:pl-20 relative"
            style={{ 
              minHeight: '400px',
              height: listHeight > 0 && isDesktop ? `${listHeight}px` : 'auto'
            }}
          >
             <div 
                className={`
                    transition-all duration-300 ease-out h-full
                    ${isTransitioning ? 'opacity-0 translate-y-2 blur-sm' : 'opacity-100 translate-y-0 blur-0'}
                `}
             >
                {/* Above Line Container */}
                {(products[activeProduct].descriptionPosition === 'above' || products[activeProduct].descriptionPosition === 'split') && (
                    <div 
                        className="lg:absolute lg:left-0 lg:right-0 lg:pb-6 mb-4 lg:mb-0"
                        style={{ 
                            bottom: `calc(100% - ${linePosition}px)`
                        }}
                    >
                        <p className="font-anonymous text-xl md:text-2xl lg:text-3xl leading-relaxed text-white/90">
                            {products[activeProduct].description}
                        </p>
                    </div>
                )}

                {/* Below Line Container */}
                {(products[activeProduct].descriptionPosition === 'below' || products[activeProduct].descriptionPosition === 'split') && (
                    <div 
                        className="lg:absolute lg:left-0 lg:right-0 lg:pt-6"
                        style={{ 
                            top: `${linePosition}px`
                        }}
                    >
                        <p className="font-anonymous text-xl md:text-2xl lg:text-3xl leading-relaxed text-white/90">
                            {products[activeProduct].descriptionPosition === 'split' 
                                ? products[activeProduct].descriptionPart2 
                                : products[activeProduct].description}
                        </p>
                    </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
