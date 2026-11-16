'use client';

import React, { useEffect, useState } from "react";
import { isInAppBrowser, isAndroid, isIOS } from "../lib/detectInAppBrowser";

export function InAppBrowserNotice() {
  const [showNotice, setShowNotice] = useState(false);

  useEffect(() => {
    if (!isInAppBrowser()) return;

    if (isAndroid()) {
      // Android auto-breakout: launches native Chrome directly
      const cleanUrl = window.location.href.replace(/https?:\/\//, "");
      window.location.href = `intent://${cleanUrl}#Intent;scheme=https;package=com.android.chrome;end`;
    } else if (isIOS()) {
      // iOS: Apple blocks automatic breakouts, so show UI guidance
      const dismissed =
        typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem("dismiss_inapp_notice") === "true";
      if (!dismissed) {
        setShowNotice(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowNotice(false);
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("dismiss_inapp_notice", "true");
    }
  };

  if (!showNotice) return null;

  return (
    <aside
      role="alert"
      className="fixed top-0 left-0 right-0 z-[99999] bg-[#161226]/95 backdrop-blur-md border-b border-purple-500/30 text-white px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 shadow-2xl transition-all duration-300"
      style={{
        boxShadow: "0 10px 30px -5px rgba(0,0,0,0.7), 0 0 15px rgba(124,58,237,0.2)",
      }}
    >
      <div className="flex items-center gap-2.5 text-xs sm:text-sm font-sans text-white/90 leading-snug">
        <span className="text-base sm:text-lg flex-shrink-0" aria-hidden="true">🔒</span>
        <span>
          For Google Sign-In, tap <strong className="text-white font-semibold tracking-wider">•••</strong> at top-right and select{" "}
          <strong className="text-purple-300 font-semibold">&ldquo;Open in Safari&rdquo;</strong>.
        </span>
      </div>
      <button
        onClick={handleDismiss}
        type="button"
        className="flex-shrink-0 text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10 text-base leading-none cursor-pointer"
        aria-label="Close notice"
      >
        ✕
      </button>
    </aside>
  );
}

export default InAppBrowserNotice;
