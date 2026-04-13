export type Locale = "ko" | "en";

export const LOCALE_COOKIE = "locale";

/** middleware가 넣는 요청 헤더 (쿠키보다 먼저 반영) */
export const LOCALE_EFFECTIVE_HEADER = "x-locale-effective";

export function isLocale(v: string | undefined): v is Locale {
  return v === "ko" || v === "en";
}

export function parseLocaleCookie(v: string | undefined): Locale {
  return isLocale(v) ? v : "ko";
}
