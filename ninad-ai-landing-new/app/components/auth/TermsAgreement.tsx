"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";

interface TermsAgreementProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
}

const TERMS_FILE_URL = "/assets/terms-and-conditions/terms-and-conditions.txt";

type TermsBlock =
  | { type: "title" | "meta" | "section" | "notice" | "paragraph"; text: string }
  | { type: "list"; items: string[] };

function parseTermsText(rawText: string): TermsBlock[] {
  const lines = rawText.replace(/\r/g, "").split("\n").map((line) => line.trim());
  const blocks: TermsBlock[] = [];

  let paragraphLines: string[] = [];
  let listItems: string[] = [];
  let currentListItem = "";

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    blocks.push({
      type: "paragraph",
      text: paragraphLines.join(" ").replace(/\s+/g, " ").trim(),
    });
    paragraphLines = [];
  };

  const flushListItem = () => {
    if (!currentListItem) return;
    listItems.push(currentListItem.replace(/\s+/g, " ").trim());
    currentListItem = "";
  };

  const flushList = () => {
    if (listItems.length === 0) return;
    blocks.push({ type: "list", items: listItems });
    listItems = [];
  };

  const flushTextBlocks = () => {
    flushParagraph();
    flushListItem();
    flushList();
  };

  const isTitleLine = (line: string) => line.toLowerCase().startsWith("end user terms and conditions");
  const isMetaLine = (line: string) => line.startsWith("Last Updated:") || line.startsWith("Effective Date:");
  const isSectionLine = (line: string) => /^\d+\.\s+/.test(line);
  const isNoticeLine = (line: string) =>
    line === "PLEASE READ CAREFULLY" ||
    line.startsWith("IMPORTANT:") ||
    line.startsWith("IMPORTANT SAFETY NOTICE:");
  const isUppercaseLine = (line: string) => /[A-Z]/.test(line) && line === line.toUpperCase();

  const isStandaloneLabelLine = (line: string) => /^[A-Za-z][A-Za-z\s/]+:\s/.test(line);
  const isTopLevelLine = (line: string) =>
    isTitleLine(line) || isMetaLine(line) || isSectionLine(line) || isNoticeLine(line);

  let noticeBlockIndex: number | null = null;

  for (const line of lines) {
    if (!line) {
      flushTextBlocks();
      noticeBlockIndex = null;
      continue;
    }

    if (line.startsWith("●")) {
      flushParagraph();
      flushListItem();
      currentListItem = line.replace(/^●\s*/, "");
      noticeBlockIndex = null;
      continue;
    }

    if (currentListItem) {
      if (isTopLevelLine(line) || isStandaloneLabelLine(line)) {
        flushListItem();
        flushList();
      } else {
        currentListItem = `${currentListItem} ${line}`;
        continue;
      }
    }

    if (noticeBlockIndex !== null && isUppercaseLine(line) && !isTopLevelLine(line)) {
      const currentNotice = blocks[noticeBlockIndex];
      if (currentNotice && currentNotice.type === "notice") {
        currentNotice.text = `${currentNotice.text} ${line}`.replace(/\s+/g, " ").trim();
        continue;
      }
    }

    if (isTitleLine(line)) {
      flushTextBlocks();
      blocks.push({ type: "title", text: line });
      noticeBlockIndex = null;
      continue;
    }

    if (isMetaLine(line)) {
      flushTextBlocks();
      blocks.push({ type: "meta", text: line });
      noticeBlockIndex = null;
      continue;
    }

    if (isSectionLine(line)) {
      flushTextBlocks();
      blocks.push({ type: "section", text: line });
      noticeBlockIndex = null;
      continue;
    }

    if (isNoticeLine(line)) {
      flushTextBlocks();
      blocks.push({ type: "notice", text: line });
      noticeBlockIndex = blocks.length - 1;
      continue;
    }

    noticeBlockIndex = null;
    paragraphLines.push(line);
  }

  flushTextBlocks();
  return blocks;
}

export default function TermsAgreement({
  checked,
  onCheckedChange,
  className = "",
}: TermsAgreementProps) {
  const checkboxId = useId();
  const dialogTitleId = useId();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [termsText, setTermsText] = useState("Loading terms and conditions...");
  const termsBlocks = useMemo(() => parseTermsText(termsText), [termsText]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

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
          setTermsText("Unable to load terms right now. Please try again shortly.");
        }
      }
    };

    loadTerms();

    return () => {
      cancelled = true;
    };
  }, [isModalOpen]);

  return (
    <>
      <div className={`flex items-start gap-2.5 ${className}`.trim()}>
        <input
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/30 bg-transparent accent-primary"
        />

        <div className="text-xs leading-5 text-white/80">
          <label htmlFor={checkboxId} className="cursor-pointer">
            I have read and agree to the{" "}
          </label>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="font-semibold text-primary-light transition-colors hover:text-white"
          >
            Terms & Conditions
          </button>
          .
        </div>
      </div>

      {isClient && isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 sm:p-6">
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby={dialogTitleId}
              className="relative flex max-h-[90vh] w-[94vw] max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-black/90 shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
            >
              <div className="pointer-events-none absolute inset-0 opacity-80">
                <div className="absolute -top-24 right-[-8%] h-56 w-56 rounded-full bg-rose-500/20 blur-[80px]" />
                <div className="absolute -bottom-20 left-[-8%] h-56 w-56 rounded-full bg-indigo-500/20 blur-[80px]" />
              </div>

              <div className="relative flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 sm:px-7 sm:py-5">
                <h3 id={dialogTitleId} className="text-lg font-semibold text-white sm:text-xl">
                  Terms & Conditions
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 text-white/80 transition-all duration-200 hover:border-white/55 hover:bg-white/10 hover:text-white"
                  aria-label="Close terms dialog"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>

              <div className="relative flex-1 overflow-y-auto px-5 pb-5 pt-4 sm:px-7 sm:pb-7 sm:pt-5">
                <div className="space-y-4 text-sm leading-relaxed text-white/80">
                  {termsBlocks.map((block, index) => {
                    if (index === 0 && block.type === "title") {
                      return null;
                    }

                    if (block.type === "title") {
                      return (
                        <h4 key={`${block.type}-${index}`} className="text-base font-semibold text-white">
                          {block.text}
                        </h4>
                      );
                    }

                    if (block.type === "meta") {
                      return (
                        <p key={`${block.type}-${index}`} className="text-sm font-medium text-white/70">
                          {block.text}
                        </p>
                      );
                    }

                    if (block.type === "section") {
                      return (
                        <h5 key={`${block.type}-${index}`} className="pt-1 text-sm font-semibold text-white/95 sm:text-base">
                          {block.text}
                        </h5>
                      );
                    }

                    if (block.type === "notice") {
                      return (
                        <p key={`${block.type}-${index}`} className="font-semibold uppercase tracking-wide text-amber-200/95">
                          {block.text}
                        </p>
                      );
                    }

                    if (block.type === "list") {
                      return (
                        <ul key={`${block.type}-${index}`} className="list-disc space-y-2 pl-5 marker:text-white/70">
                          {block.items.map((item, itemIndex) => (
                            <li key={`${index}-${itemIndex}`}>{item}</li>
                          ))}
                        </ul>
                      );
                    }

                    return <p key={`${block.type}-${index}`}>{block.text}</p>;
                  })}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
