"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#products", label: "Products" },
  { href: "#use-cases", label: "Use Cases" },
  { href: "#pricing", label: "Pricing" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled || isMobileMenuOpen 
          ? "bg-black/70 backdrop-blur-xl border-b border-white/10 py-4" 
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-20 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="relative w-32 h-8 md:w-40 md:h-10 flex-shrink-0 z-50">
          <Image
            src="/assets/ninad-ai.png"
            alt="Ninad AI"
            fill
            className="object-contain object-left"
            priority
          />
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-sans text-sm font-medium text-white/70 hover:text-white transition-colors uppercase tracking-wide"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <a
            href="#waitlist"
            className="px-6 py-2.5 rounded-full bg-white text-black font-sans font-bold text-sm hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            Book Demo
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 group"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span 
            className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
              isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
            }`} 
          />
          <span 
            className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
              isMobileMenuOpen ? "opacity-0" : ""
            }`} 
          />
          <span 
            className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${
              isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`} 
          />
        </button>

        {/* Mobile Menu Content */}
        <div 
          className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex flex-col items-center justify-center gap-8 transition-all duration-300 ${
            isMobileMenuOpen 
              ? "opacity-100 pointer-events-auto" 
              : "opacity-0 pointer-events-none"
          }`}
        >
          <nav className="flex flex-col items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-sans text-2xl font-bold text-white hover:text-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <a
            href="#waitlist"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-8 py-4 rounded-full bg-primary text-white font-sans font-bold text-lg shadow-lg hover:bg-primary-light transition-colors"
          >
            Book Demo
          </a>
        </div>
      </div>
    </header>
  );
}
