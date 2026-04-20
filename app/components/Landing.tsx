"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { fetchHeroSlides } from "@/lib/hero-fetch";
import type { HeroSlide } from "@/lib/hero-types";
import { HeroBackdrop } from "./HeroBackdrop";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "./I18nProvider";

export function Landing() {
  const { t } = useI18n();
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    fetchHeroSlides(ac.signal).then(({ slides }) => {
      if (!ac.signal.aborted) setHeroSlides(slides);
    });
    return () => ac.abort();
  }, []);

  /** 레거시: Spline 워터마크 가림용 하단 좌·우 검은 박스(div)가 DOM에 남아 있으면 제거 */
  useLayoutEffect(() => {
    for (const el of document.querySelectorAll('div[aria-hidden="true"]')) {
      if (el.childElementCount !== 0) continue;
      const cls = el.getAttribute("class") ?? "";
      if (!cls.includes("fixed") || !cls.includes("bottom-0")) continue;
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed") continue;
      const r = el.getBoundingClientRect();
      if (r.height < 50 || r.height > 160 || r.width < 200 || r.width > 520) continue;
      const bg = cs.backgroundColor;
      if (bg === "rgb(0, 0, 0)" || bg === "rgba(0, 0, 0, 1)") {
        el.remove();
      }
    }
  }, []);

  return (
    <>
      <div className="relative z-20 isolate flex h-screen min-h-0 flex-col overflow-hidden bg-transparent text-zinc-100">
        <HeroBackdrop slides={heroSlides} />
        <header className="relative z-10 flex shrink-0 items-center justify-between gap-4 px-6 py-5 sm:px-10">
          <span className="text-sm font-bold tracking-[0.2em] text-zinc-400">
            U:RION
          </span>
          <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
            <LanguageSwitcher />
            <nav className="flex items-center gap-6 text-sm font-medium sm:gap-8">
              <Link
                href="/about"
                className="text-zinc-300 transition-colors hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline"
              >
                {t.landing.about}
              </Link>
              {/* 헤더 문의하기 — 비표시
              <button
                type="button"
                onClick={openContact}
                className="rounded-sm text-zinc-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508]"
              >
                {t.landing.contactUs}
              </button>
              */}
            </nav>
          </div>
        </header>

        <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-24 pt-2 sm:px-10 sm:pb-28">
          <div className="mx-auto max-w-4xl text-center">
            {/* 히어로 카피·설명·메인 문의 CTA — 비표시
            <h1 className="bg-gradient-to-br from-white via-zinc-100 to-zinc-500 bg-clip-text text-5xl font-extrabold leading-[1.05] tracking-tight text-transparent sm:text-6xl md:text-7xl lg:text-8xl">
              {t.landing.heroLine1}
              <br />
              {t.landing.heroLine2}
            </h1>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
              {locale === "en" ? (
                <>
                  <span className="font-bold text-zinc-300">U:RION</span>
                  {t.landing.heroSubEnAfterBrand}
                </>
              ) : (
                <>
                  <span className="font-bold text-zinc-300">유리온</span>
                  {t.landing.heroSubKoAfterBrand}
                </>
              )}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={openContact}
                className="inline-flex min-h-14 min-w-[200px] items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-zinc-950 shadow-[0_0_40px_-10px_rgba(255,255,255,0.35)] transition-[transform,box-shadow] hover:shadow-[0_0_50px_-8px_rgba(255,255,255,0.45)] active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#050508]"
              >
                {t.landing.ctaContact}
              </button>
            </div>
            */}
          </div>
        </main>

      </div>

      <footer className="fixed inset-x-0 bottom-0 z-[49] border-t border-white/10 bg-black/90 px-6 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:py-4 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="text-center text-xs text-zinc-500 sm:text-sm">
          © {new Date().getFullYear()}{" "}
          <span className="font-bold text-zinc-400">U:RION</span>
        </p>
      </footer>

      {/* 문의 모달 — 헤더/메인 문의 버튼 비표시로 열 수 없음
      <ContactModal open={contactOpen} onClose={closeContact} />
      */}
    </>
  );
}
