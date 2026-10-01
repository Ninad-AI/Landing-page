/**
 * Errors the voice socket can report before a session has started that
 * deserve their own screen rather than a generic toast.
 *
 * The server sends no machine-readable code for these — only a message — so
 * they are recognised by wording. Both matchers are deliberately narrow: an
 * unrecognised message falls through to the call page's existing handling.
 */
export type PreSessionErrorKind = "creator-busy" | "creator-unavailable";

export function classifyPreSessionError(message: string): PreSessionErrorKind | null {
  const lower = message.toLowerCase();

  // "<Name> is at full capacity (<N> concurrent sessions)" — this creator's own
  // call cap. The "concurrent session" half keeps "All providers are at full
  // capacity" out: that one means something different and keeps its old
  // handling. The number is never read, so no limit is hard-coded here.
  if (lower.includes("full capacity") && lower.includes("concurrent session")) {
    return "creator-busy";
  }

  // "Unknown creator: <id>" — the backend doesn't know this creator, e.g. it
  // hasn't restarted on the code that added them.
  if (lower.startsWith("unknown creator")) {
    return "creator-unavailable";
  }

  return null;
}
