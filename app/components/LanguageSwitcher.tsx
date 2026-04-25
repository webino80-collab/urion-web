"use client";

import { useI18n } from "./I18nProvider";
import type { Locale } from "@/lib/i18n/locale";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  function select(next: Locale) {
    if (next === locale) return;
    setLocale(next);
  }

  return (
    <div
      className="flex items-center gap-0.5 rounded-full border border-white/10 bg-black/20 p-0.5"
      role="group"
      aria-label={t.lang.switchAria}
    >
      <button
        type="button"
        onClick={() => select("ko")}
        className={`inline-flex min-h-12 items-center rounded-full px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 sm:px-4 ${
          locale === "ko"
            ? "bg-white/15 text-white"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        {t.lang.switchKo}
      </button>
      <button
        type="button"
        onClick={() => select("en")}
        className={`inline-flex min-h-12 items-center rounded-full px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 sm:px-4 ${
          locale === "en"
            ? "bg-white/15 text-white"
            : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        {t.lang.switchEn}
      </button>
    </div>
  );
}
