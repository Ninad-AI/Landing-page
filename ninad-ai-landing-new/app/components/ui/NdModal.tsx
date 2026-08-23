"use client";

import type { CSSProperties, ReactNode } from "react";

interface NdModalProps {
  onClose?: () => void;
  children: ReactNode;
  maxWidth?: number;
  zIndex?: number;
}

export default function NdModal({ onClose, children, maxWidth = 420, zIndex = 70 }: NdModalProps) {
  return (
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center sm:p-8 animate-nd-fade"
      style={{ zIndex, background: "rgba(28,26,31,.55)" }}
    >
      {onClose && (
        <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      )}
      <div
        className="nd-modal-card relative w-full animate-nd-sheet sm:animate-nd-pop max-h-[90vh] overflow-y-auto rounded-t-[26px] sm:rounded-[24px] px-5 pt-5 pb-7 sm:p-[30px_28px]"
        style={
          {
            "--nd-modal-max": `${maxWidth}px`,
            background: "var(--nd-bg)",
            boxShadow: "0 40px 90px -30px rgba(28,26,31,.5)",
          } as CSSProperties
        }
      >
        <div className="sm:hidden w-[38px] h-1 rounded-full bg-nd-line mx-auto mb-5" />
        {children}
      </div>
    </div>
  );
}
