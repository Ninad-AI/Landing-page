"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../lib/stores";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#products", label: "Products" },
  { href: "/creators", label: "Creators" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpenPath, setMobileMenuOpenPath] = useState<string | null>(null);

  const { user, isAuthenticated, logout, isHydrated } = useAuthStore();

  // Page type detection
  const isAdminPage = pathname.startsWith('/admin');
  const isVoiceChatPage = /^\/creators\/[^/]+\/voice-chat\/?$/.test(pathname);
  const isMinimalHeader = isAdminPage;
  const isMobileMenuOpen = mobileMenuOpenPath === pathname;

  const handleLogoClick = () => {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#hero");
    }
  };

  useEffect(() => {
    if (isVoiceChatPage) return;

    const handleScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(currentScroll > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isVoiceChatPage, pathname]);

  useEffect(() => {
    if (isVoiceChatPage) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;

    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [isMobileMenuOpen, isVoiceChatPage]);

  if (isVoiceChatPage) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push("/");
    setMobileMenuOpenPath(null);
  };

  /* ═══════════════════════════════════════════════
     DEFAULT + ADMIN HEADER
     ═══════════════════════════════════════════════ */
  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-[background-color,padding] duration-300 ease-out ${isMobileMenuOpen
        ? "bg-transparent py-6 border-b border-transparent"
        : isScrolled
          ? "bg-black/55 backdrop-blur-xl py-6 border-b border-white/10"
          : "bg-transparent py-8 border-b border-transparent"
        }`}
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-12 xl:px-20 flex items-center justify-between lg:justify-center relative">
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="relative w-32 h-8 md:w-40 md:h-10 shrink-0 z-50 cursor-pointer bg-none border-none p-0 lg:absolute lg:left-12 xl:left-20"
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
        {!isMinimalHeader && (
          <nav className="hidden lg:flex items-center gap-5 xl:gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`font-sans text-sm font-medium hover:text-white transition-colors uppercase tracking-wide ${
                  pathname === link.href ? "text-white" : "text-white/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {/* Desktop CTA / Auth Section */}
        {isAdminPage ? (
          <div className="flex items-center absolute right-6 lg:right-12 xl:right-20">
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-transparent border border-white/15 text-white/70 font-sans font-medium text-sm transition-all duration-300 hover:text-white hover:border-white/40 cursor-pointer"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 lg:absolute lg:right-12 xl:right-20">
            {isHydrated && isAuthenticated && user ? (
              <>
                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-sans font-semibold text-sm transition-all duration-300 hover:bg-white/20 hover:border-white/40"
                >
                  Dashboard
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="w-9 h-9 rounded-full bg-transparent border border-white/15 text-white/70 transition-all duration-300 hover:text-white hover:border-white/40 flex items-center justify-center cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H9" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 20H6a2 2 0 01-2-2V6a2 2 0 012-2h7" />
                  </svg>
                </button>
              </>
            ) : (
              <>
                <Link
                  href={`/login?redirect=${encodeURIComponent(pathname)}`}
                  className="px-3 py-2 text-white/70 font-sans font-medium text-sm transition-all duration-300 hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/book-demo"
                  className="px-5 py-2.5 rounded-full bg-white text-black font-sans font-bold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-primary hover:text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.6)]"
                >
                  Book Demo
                </Link>
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Toggle */}
        {!isMinimalHeader && (
          <button
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden relative z-50 h-11 w-11 flex flex-col items-center justify-center gap-1.5 group"
            onClick={() =>
              setMobileMenuOpenPath((currentPath) =>
                currentPath === pathname ? null : pathname
              )
            }
          >
            <span
              className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                }`}
            />
            <span
              className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""
                }`}
            />
            <span
              className={`w-6 h-0.5 bg-white rounded-full transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                }`}
            />
          </button>
        )}

        {/* Mobile Menu Content */}
        <div
          className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex min-h-dvh flex-col items-center justify-start gap-6 overflow-y-auto px-6 pb-[calc(env(safe-area-inset-bottom)+2rem)] pt-[calc(env(safe-area-inset-top)+5.5rem)] transition-transform duration-500 ease-in-out ${isMobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full"
            }`}
        >
          <nav className="flex flex-col items-center gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpenPath(null)}
                className="font-sans text-xl sm:text-2xl font-bold text-white hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {isHydrated && isAuthenticated && user ? (
            <div className="flex flex-col items-center gap-4">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpenPath(null)}
                className="px-8 py-4 rounded-full bg-primary text-white font-sans font-bold text-lg shadow-lg hover:bg-primary-light transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-8 py-3 rounded-full bg-transparent border border-white/20 text-white/70 font-sans font-medium text-base hover:text-white hover:border-white/40 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/book-demo"
                onClick={() => setMobileMenuOpenPath(null)}
                className="px-8 py-4 rounded-full bg-primary text-white font-sans font-bold text-lg shadow-lg hover:bg-primary-light transition-colors"
              >
                Book Demo
              </Link>
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}`}
                onClick={() => setMobileMenuOpenPath(null)}
                className="text-sm font-sans font-medium text-white/70 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
