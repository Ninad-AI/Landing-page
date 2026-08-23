"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "../lib/stores";

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/creators", label: "Creators" },
  { href: "/for-creators", label: "For creators" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpenPath, setMobileMenuOpenPath] = useState<string | null>(null);

  const { user, isAuthenticated, logout, isHydrated } = useAuthStore();
  const showAnalyticsLink = isAuthenticated && (user?.role === 'influencer' || user?.role === 'admin');

  // Page type detection
  const isAdminPage = pathname.startsWith('/admin');
  const isVoiceChatPage = /^\/creators\/[^/]+\/voice-chat\/?$/.test(pathname);
  const isMinimalHeader = isAdminPage || isVoiceChatPage;
  const isMobileMenuOpen = mobileMenuOpenPath === pathname;
  const voiceChatCreatorSlug = pathname.match(/^\/creators\/([^/]+)\/voice-chat\/?$/)?.[1];

  const handleLogoClick = () => {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#hero");
    }
  };

  useEffect(() => {
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
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    router.push("/");
    setMobileMenuOpenPath(null);
  };

  const handleVoiceChatClose = () => {
    const targetPath = voiceChatCreatorSlug
      ? `/creators/${encodeURIComponent(voiceChatCreatorSlug)}`
      : "/creators";

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("ninad:voice-chat-exit"));
    }

    router.replace(targetPath);
  };

  /* ═══════════════════════════════════════════════
     DEFAULT + ADMIN HEADER
     ═══════════════════════════════════════════════ */
  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-[background-color,padding,box-shadow] duration-300 ease-out ${isMobileMenuOpen
        ? "bg-transparent py-6 border-b border-transparent"
        : isVoiceChatPage
          ? "bg-nd-darker/90 backdrop-blur-xl py-5 border-b border-white/10 shadow-[0_1px_0_rgba(0,0,0,0.2)]"
          : "bg-nd-bg/90 backdrop-blur-xl py-5 border-b border-transparent shadow-[0_1px_0_rgba(28,26,31,0.04)]"
        }`}
    >
      <div className="container mx-auto px-6 md:px-12 lg:px-12 xl:px-20 flex items-center justify-between lg:justify-center relative">
        {/* Logo */}
        <button
          onClick={handleLogoClick}
          className="relative w-32 h-8 md:w-40 md:h-10 shrink-0 z-50 cursor-pointer bg-none border-none p-0 lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:left-12 xl:left-20"
        >
          <Image
            src="/assets/ninad-ai.png"
            alt="Ninad AI"
            fill
            sizes="(max-width: 768px) 128px, 160px"
            className={`object-contain object-left transition-[filter] duration-300 ${isVoiceChatPage ? "brightness-0 invert" : ""}`}
            priority
          />
        </button>

        {/* Desktop Nav */}
        {!isMinimalHeader && (
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`font-nd-sans text-[13.5px] font-bold rounded-full px-4 py-2 transition-colors hover:bg-nd-tint ${
                  pathname === link.href ? "bg-nd-tint text-nd-ink" : "text-nd-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
            {showAnalyticsLink && (
              <Link
                href={user?.role === 'admin' ? '/admin/analytics' : '/dashboard'}
                className={`font-nd-sans text-[13.5px] font-bold rounded-full px-4 py-2 transition-colors hover:bg-nd-tint ${
                  pathname === '/admin/analytics' || pathname === '/dashboard' ? "bg-nd-tint text-nd-ink" : "text-nd-muted"
                }`}
              >
                Analytics
              </Link>
            )}
          </nav>
        )}

        {/* Desktop CTA / Auth Section */}
        {isMinimalHeader ? (
          <div className="flex items-center absolute top-1/2 -translate-y-1/2 right-6 lg:right-12 xl:right-20">
            {isAdminPage ? (
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-transparent border border-nd-line text-nd-muted font-nd-sans font-medium text-sm transition-all duration-300 hover:text-nd-ink hover:border-nd-ink cursor-pointer"
              >
                Logout
              </button>
            ) : isVoiceChatPage ? (
              <button
                type="button"
                aria-label="Close voice chat"
                onClick={handleVoiceChatClose}
                className="group inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/8 backdrop-blur-md text-white/70 transition-all duration-300 hover:bg-white/15 hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            ) : null}
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-2 lg:absolute lg:top-1/2 lg:-translate-y-1/2 lg:right-12 xl:right-20">
            {isHydrated && isAuthenticated && user ? (
              <>
                {/* Dashboard Link */}
                <Link
                  href="/dashboard"
                  className="px-4 py-2 rounded-full bg-nd-tint border border-nd-line text-nd-ink font-nd-sans font-semibold text-sm transition-all duration-300 hover:bg-nd-panel"
                >
                  Dashboard
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="w-9 h-9 rounded-full bg-transparent border border-nd-line text-nd-muted transition-all duration-300 hover:text-nd-ink hover:border-nd-ink flex items-center justify-center cursor-pointer"
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
                  className="px-3 py-2 text-nd-muted font-nd-sans font-medium text-sm transition-all duration-300 hover:text-nd-ink"
                >
                  Sign In
                </Link>
                <Link
                  href="/creators"
                  className="px-5 py-2.5 rounded-full bg-nd-ink text-nd-bg font-nd-sans font-bold text-sm transition-all duration-300 hover:bg-[#302C36]"
                >
                  Browse creators
                </Link>
              </>
            )}
          </div>
        )}

        {/* Mobile Menu Toggle */}
        {!isMinimalHeader && (
          <button
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-controls="mobile-menu"
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden relative z-50 h-12 w-12 flex flex-col items-center justify-center gap-1.5 group cursor-pointer bg-none border-none p-0"
            onClick={() =>
              setMobileMenuOpenPath((currentPath) =>
                currentPath === pathname ? null : pathname
              )
            }
          >
            <span
              className={`block w-6 h-[2.5px] bg-nd-ink rounded-full transition-all duration-300 ${isMobileMenuOpen ? "rotate-45 translate-y-[4.5px]" : ""
                }`}
            />
            <span
              className={`block w-6 h-[2.5px] bg-nd-ink rounded-full transition-all duration-300 ${isMobileMenuOpen ? "opacity-0" : ""
                }`}
            />
            <span
              className={`block w-6 h-[2.5px] bg-nd-ink rounded-full transition-all duration-300 ${isMobileMenuOpen ? "-rotate-45 -translate-y-[4.5px]" : ""
                }`}
            />
          </button>
        )}

        {/* Mobile Menu Content — top dropdown sheet, sits below the fixed header (lower z-index) */}
        {!isMinimalHeader && isMobileMenuOpen && (
          <div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="lg:hidden fixed inset-0 z-40 bg-[rgba(28,26,31,.5)] animate-nd-fade"
            onClick={() => setMobileMenuOpenPath(null)}
          >
            <div
              className="absolute left-0 right-0 top-0 bg-nd-bg rounded-b-3xl px-5 pb-5 animate-nd-up"
              style={{ paddingTop: "calc(env(safe-area-inset-top) + 90px)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="flex flex-col">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpenPath(null)}
                    className="text-left py-4 border-b border-nd-line-soft font-display text-2xl text-nd-ink"
                  >
                    {link.label}
                  </Link>
                ))}
                {showAnalyticsLink && (
                  <Link
                    href={user?.role === 'admin' ? '/admin/analytics' : '/dashboard'}
                    onClick={() => setMobileMenuOpenPath(null)}
                    className="text-left py-4 border-b border-nd-line-soft font-display text-2xl text-nd-ink"
                  >
                    Analytics
                  </Link>
                )}
                {isHydrated && isAuthenticated && user ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpenPath(null)}
                      className="text-left py-4 border-b border-nd-line-soft font-display text-2xl text-nd-ink"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-left py-4 font-display text-2xl text-nd-accent cursor-pointer"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/creators"
                      onClick={() => setMobileMenuOpenPath(null)}
                      className="text-left py-4 border-b border-nd-line-soft font-display text-2xl text-nd-ink"
                    >
                      Browse creators
                    </Link>
                    <Link
                      href={`/login?redirect=${encodeURIComponent(pathname)}`}
                      onClick={() => setMobileMenuOpenPath(null)}
                      className="text-left py-4 font-display text-2xl text-nd-accent"
                    >
                      Sign in
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
