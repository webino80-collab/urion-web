"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
// import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "./I18nProvider";

export function AboutOverlay() {
  const router = useRouter();
  const { t } = useI18n();

  const close = useCallback(() => {
    if (typeof window === "undefined") return;
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
      <div
        className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950 px-8 pb-8 pt-8 shadow-2xl"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <h1
            id="about-overlay-title"
            className="min-w-0 flex-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            <span className="font-bold">U:RION</span>
            <span className="text-zinc-300"> CEO</span>
          </h1>
          <div className="flex shrink-0 items-center gap-2">
            {/* 언어 토글 (한국어 / English) — 필요 시 위 LanguageSwitcher import 주석 해제 후 아래 주석 해제
            <LanguageSwitcher />
            */}
            <button
              type="button"
              onClick={close}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80"
              aria-label={t.about.closeAria}
            >
              <svg
                className="h-6 w-6"
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

        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,12rem)_1fr] lg:items-center lg:gap-10">
          <div className="flex flex-col items-center lg:items-stretch">
            <div className="relative aspect-square w-full max-w-[12rem] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 lg:max-w-none">
              <Image
                src="/images/ceo3.webp"
                alt={t.about.ceoAlt}
                fill
                sizes="(max-width: 1024px) 192px, 192px"
                className="object-cover object-top"
                priority
              />
            </div>
          </div>

          <div className="min-w-0 pt-2 text-left lg:pt-0">
            {t.about.missionKoParagraphs.map((para, i) => (
              <p
                key={`about-ko-${i}`}
                className={`whitespace-pre-line break-keep text-[1.125rem] leading-[1.6] text-zinc-300 ${
                  i > 0 ? "mt-4" : ""
                }`}
              >
                {para}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
