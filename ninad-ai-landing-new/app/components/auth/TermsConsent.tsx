"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

interface TermsConsentProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  compact?: boolean;
}

const TERMS_FILE_URL = "/assets/terms-and-conditions/terms-and-conditions.txt";
const SCROLL_END_OFFSET_PX = 4;

function hasScrolledToEnd(element: HTMLDivElement): boolean {
  return element.scrollTop + element.clientHeight >= element.scrollHeight - SCROLL_END_OFFSET_PX;
}

export default function TermsConsent({
  checked,
  onCheckedChange,
  className = "",
  compact = false,
}: TermsConsentProps) {
  const [termsText, setTermsText] = useState("Loading terms and conditions...");
  const [isLoading, setIsLoading] = useState(true);
  const [isScrollComplete, setIsScrollComplete] = useState(false);

  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (compact) {
      setIsLoading(false);
      setIsScrollComplete(true);
      return;
    }

    let cancelled = false;

    const loadTerms = async () => {
      try {
        const response = await fetch(TERMS_FILE_URL, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Unable to load terms file.");
        }

        const text = await response.text();
        if (!cancelled) {
          setTermsText(text.trim());
        }
      } catch {
        if (!cancelled) {
          setTermsText("Unable to load terms right now. Please open the full Terms & Conditions page.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadTerms();

    return () => {
      cancelled = true;
    };
  }, [compact]);

  useEffect(() => {
    if (compact) return;
    if (isLoading) return;

    const node = termsRef.current;
    if (!node) return;

    const frameId = window.requestAnimationFrame(() => {
      const hasScroll = node.scrollHeight > node.clientHeight + 1;
      if (!hasScroll || hasScrolledToEnd(node)) {
        setIsScrollComplete(true);
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [compact, isLoading, termsText]);

  const handleTermsScroll = () => {
    if (compact) return;
    const node = termsRef.current;
    if (!node || isScrollComplete) return;

    if (hasScrolledToEnd(node)) {
      setIsScrollComplete(true);
    }
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    onCheckedChange(event.target.checked);
  };

  return (
    <div className={`rounded-xl border border-white/10 bg-white/3 p-3 ${className}`.trim()}>
      {!compact && (
        <>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/60">
            Terms & Conditions
          </p>
          <p className="mt-1 text-[11px] text-white/45">
            Review the terms below, then accept to continue.
          </p>

          <div
            ref={termsRef}
            onScroll={handleTermsScroll}
            className="mt-2 max-h-28 overflow-y-auto rounded-lg border border-white/10 bg-black/30 p-3 text-[11px] leading-relaxed text-white/65 whitespace-pre-wrap"
          >
            {termsText}
          </div>
        </>
      )}

      <label className={`${compact ? "mt-1" : "mt-3"} grid grid-cols-[auto_1fr] items-start gap-x-2.5`}>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheckboxChange}
          disabled={!isScrollComplete}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-transparent accent-primary disabled:cursor-not-allowed disabled:opacity-60"
        />
        <span className="text-xs leading-5 text-white/80">
          I have read and agree to the{" "}
          <Link
            href="/terms-and-conditions"
            className="font-semibold text-primary-light transition-colors hover:text-white"
          >
            Terms & Conditions
          </Link>
          .
        </span>
      </label>

      {!compact && !isScrollComplete && !isLoading && (
        <p className="mt-2 text-[11px] text-amber-200/90">
          Please review all terms to enable acceptance.
        </p>
      )}
    </div>
  );
}
