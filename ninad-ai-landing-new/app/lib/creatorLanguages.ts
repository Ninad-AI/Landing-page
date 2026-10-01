/**
 * Call-language support for creators who speak more than one language.
 *
 * A creator opts in by carrying a `languages` entry on its record in the call
 * page's registry (app/creators/[slug]/voice-chat). That one entry drives
 * everything language-related — which `?language=` values the call page will
 * forward as `language`, and the toasts that report what the server did — so a
 * creator with no entry (or a single language) behaves exactly as it always has.
 */

export interface CreatorLanguage {
  /** Code the backend uses for this language, e.g. "en" or "hi". */
  code: string;
  /** Name shown in the UI, e.g. "English". */
  name: string;
}

export interface CreatorLanguages {
  /** Code a call starts in when the caller doesn't pick one. Must be one of `options`. */
  default: string;
  options: readonly CreatorLanguage[];
}

/** English first, Hindi second. Declared once so every registry shares it. */
export const ENGLISH_AND_HINDI: CreatorLanguages = {
  default: "en",
  options: [
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
  ],
};

/** A choice only exists when there are at least two languages to pick between. */
export function offersLanguageChoice(
  languages: CreatorLanguages | undefined
): languages is CreatorLanguages {
  return !!languages && languages.options.length > 1;
}

/**
 * The language code a call should send, or undefined when none should be sent.
 *
 * `requested` comes from the URL, so anything that isn't one of the creator's
 * own options is dropped rather than forwarded to the server. Sending nothing
 * is always valid — the server then starts the call in its own default.
 */
export function resolveCallLanguage(
  languages: CreatorLanguages | undefined,
  requested: string | null | undefined
): string | undefined {
  if (!offersLanguageChoice(languages) || !requested) return undefined;
  return languages.options.some((option) => option.code === requested) ? requested : undefined;
}

export interface ActiveLanguage {
  code: string;
  name: string;
}

/**
 * Reads the language an `init_ack` or `language_switched` message reports.
 *
 * Returns null when the message names no language, so callers leave whatever
 * they were already showing alone. A missing `language_name` falls back to the
 * creator's own name for that code, then to the bare code.
 */
export function readActiveLanguage(
  msg: Record<string, unknown>,
  languages?: CreatorLanguages
): ActiveLanguage | null {
  const code = typeof msg.language === "string" ? msg.language.trim() : "";
  if (!code) return null;

  const reportedName = typeof msg.language_name === "string" ? msg.language_name.trim() : "";
  const configuredName = languages?.options.find((option) => option.code === code)?.name;
  return { code, name: reportedName || configuredName || code };
}
