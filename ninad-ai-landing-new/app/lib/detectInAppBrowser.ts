/**
 * Utilities to detect in-app browsers (WebViews) such as Instagram, Facebook, TikTok, etc.
 * and device platforms (Android, iOS).
 */

export function isInAppBrowser(): boolean {
  if (typeof window === "undefined") return false;
  const ua =
    navigator.userAgent ||
    navigator.vendor ||
    (window as unknown as { opera?: string }).opera ||
    "";
  return /Instagram|FBAN|FBAV|ByteDance|TikTok/i.test(ua);
}

export function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return /Android/i.test(navigator.userAgent || "");
}

export function isIOS(): boolean {
  if (typeof window === "undefined") return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent || "");
}
