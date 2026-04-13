"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "./I18nProvider";

export function AboutOverlay() {
  const router = useRouter();
  const { locale, t } = useI18n();

  const close = useCallback(() => {
    if (typeof window === "undefined") return;
    /** 정적 export·히스토리 한 줄 등에서 `router.back()`이 메인으로 안 갈 수 있어 항상 `/`로 이동 */
    router.replace("/");
  }, [router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-overlay-title"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 px-8 pb-8 pt-8 shadow-2xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <h1
            id="about-overlay-title"
            className="min-w-0 flex-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            {locale === "ko" ? (
              <>
                <span className="font-bold">U:RION</span>
                {" 소개"}
              </>
            ) : (
              <>
                About <span className="font-bold">U:RION</span>
              </>
            )}
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
          <button
            type="button"
            onClick={close}
            className="shrink-0 rounded-lg p-2 text-zinc-500 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80"
            aria-label={t.about.closeAria}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-zinc-400 sm:text-base">
          {t.about.body1}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
          {t.about.body2}
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={close}
            className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
          >
            {t.about.close}
          </button>
        </div>
      </div>
    </div>
  );
}
