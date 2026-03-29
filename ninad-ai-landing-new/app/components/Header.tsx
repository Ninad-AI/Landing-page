"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../lib/stores";
import { roleBadgeLabel, roleBadgeClasses } from "../lib/auth";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/#products", label: "Products" },
  { href: "/#use-cases", label: "Use Cases" },
  { href: "/#safety", label: "Safety" },
  { href: "/creators", label: "Creators" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isAuthenticated, logout, isHydrated } = useAuthStore();

  // Page type detection
  const isAdminPage = pathname.startsWith('/admin');
  // Match /creators/some-slug but NOT /creators or /creators/creator-name-creator-id (the old static route)
  const isCreatorSlugPage = /^\/creators\/[^/]+$/.test(pathname) && pathname !== '/creators/creator-name-creator-id';
  const isMinimalHeader = isAdminPage || isCreatorSlugPage;

  const handleLogoClick = () => {
    if (isCreatorSlugPage) {
      router.push("/");
      return;
    }
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#hero");
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(currentScroll > 10);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/");
    setIsMobileMenuOpen(false);
  };

  /* ═══════════════════════════════════════════════
     CREATOR SLUG PAGE — Minimal header:
     Logo (left) | Login or Logout (right) + Close button below it
     ═══════════════════════════════════════════════ */
  if (isCreatorSlugPage) {
    return (
      <header className="fixed top-0 left-0 w-full z-50 bg-transparent py-5">
        <div className="container mx-auto px-6 md:px-12 lg:px-12 xl:px-20 flex items-start justify-between">
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

          {/* Right side: Close button only */}
          <div className="flex items-center">
            {/* Close (X) button → /creators */}
            <Link
              href="/creators"
              title="Back to Creators"
              className="group w-9 h-9 rounded-full border border-white/10 bg-black/70 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:border-red-500/60 hover:bg-red-500/30 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-white/60 transition-all duration-300 group-hover:text-red-400 group-hover:rotate-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Link>
          </div>
        </div>
      </header>
    );
  }

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
          className="relative w-32 h-8 md:w-40 md:h-10 flex-shrink-0 z-50 cursor-pointer bg-none border-none p-0 lg:absolute lg:left-12 xl:left-20"
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
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
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
          <div className="hidden lg:flex items-center gap-3 lg:absolute lg:right-12 xl:right-20">
            {isHydrated && isAuthenticated && user ? (
              <>
                {/* Role Badge — admin only */}
                {user.role === 'admin' && (
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${roleBadgeClasses(user.role)}`}
                  >
                    {roleBadgeLabel(user.role)}
                  </span>
                )}

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                  {user.avatar_url ? (
                    <Image
                      src={user.avatar_url}
                      alt={user.name}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/40 flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

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
                  className="px-4 py-2 rounded-full bg-transparent border border-white/15 text-white/70 font-sans font-medium text-sm transition-all duration-300 hover:text-white hover:border-white/40 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-sans font-semibold text-sm transition-all duration-300 hover:bg-white/20 hover:border-white/40"
                >
                  Sign In
                </Link>
                <Link
                  href="/book-demo"
                  className="px-6 py-2.5 rounded-full bg-white text-black font-sans font-bold text-sm transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-primary hover:text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-110"
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
            className="lg:hidden relative z-50 w-10 h-10 flex flex-col items-center justify-center gap-1.5 group"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
          className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 flex flex-col items-center justify-start pt-32 gap-8 transition-transform duration-500 ease-in-out overflow-y-auto min-h-screen ${isMobileMenuOpen
            ? "translate-x-0"
            : "translate-x-full"
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

          {isHydrated && isAuthenticated && user ? (
            <div className="flex flex-col items-center gap-4">
              {/* Role Badge — admin only */}
              {user.role === 'admin' && (
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${roleBadgeClasses(user.role)}`}
                >
                  {roleBadgeLabel(user.role)}
                </span>
              )}

              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
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
            <div className="flex flex-col items-center gap-4">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-8 py-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-sans font-bold text-lg shadow-lg hover:bg-white/20 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/book-demo"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-8 py-4 rounded-full bg-primary text-white font-sans font-bold text-lg shadow-lg hover:bg-primary-light transition-colors"
              >
                Book Demo
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
