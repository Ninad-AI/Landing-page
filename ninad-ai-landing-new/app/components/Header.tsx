"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#products", label: "Products" },
  { href: "/#use-cases", label: "Use Cases" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/know-more", label: "Know More" },
];

export default function Header() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showScrollDivider, setShowScrollDivider] = useState(false);

  const hasShownDividerRef = useRef(false);
  const hideDividerTimerRef = useRef<number | null>(null);

  const handleLogoClick = () => {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    } else {
      // If hero section doesn't exist (we're on a different page), navigate to home with hero anchor
      router.push("/#hero");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled(scrolled);

      if (!scrolled) {
        hasShownDividerRef.current = false;
        setShowScrollDivider(false);
        if (hideDividerTimerRef.current) {
          window.clearTimeout(hideDividerTimerRef.current);
          hideDividerTimerRef.current = null;
        }
        return;
      }

      if (!hasShownDividerRef.current) {
        hasShownDividerRef.current = true;
        setShowScrollDivider(true);
        if (hideDividerTimerRef.current) {
          window.clearTimeout(hideDividerTimerRef.current);
        }
        hideDividerTimerRef.current = window.setTimeout(() => {
          setShowScrollDivider(false);
          hideDividerTimerRef.current = null;
        }, 700);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (hideDividerTimerRef.current) {
        window.clearTimeout(hideDividerTimerRef.current);
        hideDividerTimerRef.current = null;
      }
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 w-full z-50 transition-[background-color,padding] duration-300 ease-out ${
        isScrolled || isMobileMenuOpen
          ? `bg-black/55 backdrop-blur-xl py-4 ${showScrollDivider && !isMobileMenuOpen ? "border-b border-white/10" : "border-b border-transparent"}`
          : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-20 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="relative w-32 h-8 md:w-40 md:h-10 flex-shrink-0 z-50 cursor-pointer bg-none border-none p-0"
        >
          <Image
            src="/assets/ninad-ai.png"
            alt="Ninad AI"
            fill
            className="object-contain object-left"
            priority
          />
        </button>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-sans text-sm font-medium text-white/70 hover:text-white transition-colors uppercase tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:block">
          <Link
            href="/book-demo"
            className="px-6 py-2.5 rounded-full bg-white text-black font-sans font-bold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-primary hover:text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-110"
          >
            Book Demo
          </Link>
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
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-sans text-2xl font-bold text-white hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/book-demo"
            onClick={() => setIsMobileMenuOpen(false)}
            className="px-8 py-4 rounded-full bg-primary text-white font-sans font-bold text-lg shadow-lg hover:bg-primary-light transition-colors"
          >
            Book Demo
          </Link>
        </div>
      </div>
    </header>
  );
}
