"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { fetchHeroSlides } from "@/lib/hero-fetch";
import type { HeroSlide } from "@/lib/hero-types";
import { ContactSection } from "./ContactSection";
import { HeroBackdrop } from "./HeroBackdrop";
import { TpfProcessSection } from "./TpfProcessSection";
// import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "./I18nProvider";

/** 히어로 → 두 번째 섹션만 한 번에 이동(휠 임계). 그 아래는 일반 스크롤 */
const HERO_WHEEL_BLOCK_THRESHOLD = 32;
const HERO_TO_TPF_SWIPE_PX = 64;
const BLOCK_SCROLL_COOLDOWN_MS = 900;

/** 스크롤이 두 번째 섹션(TPF) 이전(히어로 풀뷰 구간)이면 true */
function isInHeroScrollRegion() {
  const tpf = document.getElementById("tpf-process");
  if (!tpf) return false;
  return window.scrollY + 2 < tpf.offsetTop;
}

function scrollTpfFromHero(behavior: ScrollBehavior) {
  const el = document.getElementById("tpf-process");
  if (!el) return;
  el.scrollIntoView({ block: "start", behavior });
}

export function Landing() {
  const { t } = useI18n();
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const blockScrollUntil = useRef(0);
  const touchStartY = useRef<number | null>(null);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    const ac = new AbortController();
    fetchHeroSlides(ac.signal).then(({ slides }) => {
      if (!ac.signal.aborted) setHeroSlides(slides);
    });
    return () => ac.abort();
  }, []);

  /** Spline 워터마크 가림용 하단 div가 남아 있으면 제거 */
  useLayoutEffect(() => {
    for (const el of document.querySelectorAll('div[aria-hidden="true"]')) {
      if (el.childElementCount !== 0) continue;
      const cls = el.getAttribute("class") ?? "";
      if (!cls.includes("fixed") || !cls.includes("bottom-0")) continue;
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed") continue;
      const r = el.getBoundingClientRect();
      if (r.height < 50 || r.height > 160 || r.width < 200 || r.width > 520)
        continue;
      const bg = cs.backgroundColor;
      if (bg === "rgb(0, 0, 0)" || bg === "rgba(0, 0, 0, 1)") {
        el.remove();
      }
    }
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileMenuOpen]);

  const scrollToTop = useCallback(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /** 히어로에서만: 첫(의미 있는) 아래 스크롤 = 두 번째 섹션 상단까지 점프. 그 외·그 이후 = 기본 */
  useEffect(() => {
    if (typeof window === "undefined" || mobileMenuOpen) return;

    const onWheel = (e: WheelEvent) => {
      if (Date.now() < blockScrollUntil.current) return;
      if (e.deltaY <= 0) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (Math.abs(e.deltaY) < HERO_WHEEL_BLOCK_THRESHOLD) return;
      if (!isInHeroScrollRegion()) return;

      e.preventDefault();
      e.stopPropagation();
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const blockBehavior: ScrollBehavior = reduced ? "auto" : "smooth";
      blockScrollUntil.current = Date.now() + BLOCK_SCROLL_COOLDOWN_MS;
      scrollTpfFromHero(blockBehavior);
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () =>
      window.removeEventListener("wheel", onWheel, { capture: true });
  }, [mobileMenuOpen]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartY.current = e.touches[0]!.clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (Date.now() < blockScrollUntil.current) return;
    if (mobileMenuOpen) return;
    if (touchStartY.current == null) return;
    if (!isInHeroScrollRegion()) {
      touchStartY.current = null;
      return;
    }
    const y = e.changedTouches[0]?.clientY;
    if (y == null) {
      touchStartY.current = null;
      return;
    }
    const dy = touchStartY.current - y;
    touchStartY.current = null;
    if (dy < HERO_TO_TPF_SWIPE_PX) return;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    blockScrollUntil.current = Date.now() + BLOCK_SCROLL_COOLDOWN_MS;
    scrollTpfFromHero(reduced ? "auto" : "smooth");
  };

  useEffect(() => {
    if (mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (Date.now() < blockScrollUntil.current) return;
      if (!isInHeroScrollRegion()) return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.closest("input") ||
          t.closest("textarea") ||
          t.closest("select") ||
          t.isContentEditable)
      ) {
        return;
      }
      if (
        e.key === "PageDown" ||
        (e.key === " " && !e.shiftKey) ||
        (e.key === "ArrowDown" && !e.altKey)
      ) {
        e.preventDefault();
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        blockScrollUntil.current = Date.now() + BLOCK_SCROLL_COOLDOWN_MS;
        scrollTpfFromHero(reduced ? "auto" : "smooth");
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="pointer-events-auto fixed inset-x-0 top-0 z-[90] flex items-center justify-between gap-4 bg-gradient-to-b from-landing-page/90 to-transparent px-6 py-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-10">
        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex min-h-12 cursor-pointer items-center px-2 text-left text-sm font-bold tracking-[0.2em] text-zinc-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent max-lg:px-0"
          aria-label={t.landing.logoHomeAria}
        >
          U:RION
        </button>
        <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
          <nav
            className="hidden items-center gap-6 text-sm font-medium sm:flex sm:gap-8"
            aria-label="Primary"
          >
            <Link
              href="/about"
              className="inline-flex min-h-12 items-center px-2 text-zinc-200 transition-colors hover:text-white focus:outline-none focus-visible:text-white focus-visible:underline"
            >
              {t.landing.about}
            </Link>
          </nav>

          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center text-zinc-200 transition-colors hover:text-white focus:outline-none focus-visible:text-white focus-visible:ring-2 focus-visible:ring-violet-500/60 max-lg:justify-end max-lg:px-0 sm:hidden"
            aria-expanded={mobileMenuOpen}
            aria-controls="landing-mobile-nav"
            aria-label={t.landing.openMenuAria}
            onClick={() => setMobileMenuOpen(true)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      <div
        className="relative z-20 w-full bg-landing-page"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="presentation"
      >
        <section
          id="hero"
          aria-label="Hero"
          className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-landing-page text-zinc-100 max-lg:pt-[calc(env(safe-area-inset-top)+5.5rem+140px)] lg:pt-0"
        >
          <HeroBackdrop slides={heroSlides} />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-24 pt-2 max-lg:pt-0 sm:px-10 sm:pb-28">
            <div className="mx-auto max-w-4xl text-center" />
          </div>
        </section>

        <section
          id="tpf-process"
          className="relative scroll-mt-24 border-t border-white/10 bg-landing-page sm:scroll-mt-28"
          aria-label={t.tpf.ariaLabel}
        >
          <TpfProcessSection />
        </section>

        <section
          id="contact"
          className="scroll-mt-24 border-t border-white/10 bg-landing-page sm:scroll-mt-28"
          aria-label={t.contact.title}
        >
          <div className="mx-auto max-w-6xl px-6 pb-6 pt-[max(5.5rem,env(safe-area-inset-top)+3.5rem)] sm:px-10 sm:pb-8 sm:pt-[max(6rem,env(safe-area-inset-top)+4rem)]">
            <ContactSection />
            <footer className="mt-16 border-t border-white/10 pt-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:mt-20 sm:pt-6 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
              <p className="text-center text-xs text-zinc-500 sm:text-sm">
                © {new Date().getFullYear()}{" "}
                <span className="font-bold text-zinc-400">U:RION</span>
              </p>
            </footer>
          </div>
        </section>
      </div>

      {mobileMenuOpen ? (
        <div
          className="fixed inset-0 z-[200] flex justify-end sm:hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="landing-mobile-nav-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-landing-page/75 backdrop-blur-sm"
            aria-label={t.about.closeAria}
            onClick={closeMobileMenu}
          />
          <nav
            id="landing-mobile-nav"
            className="relative flex h-full w-[min(100%,20rem)] flex-col border-l border-white/10 bg-landing-page/95 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-[-12px_0_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
              <p
                id="landing-mobile-nav-title"
                className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500"
              >
                {t.landing.menuSheetTitle}
              </p>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80"
                aria-label={t.about.closeAria}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <ul className="mt-6 flex flex-col gap-1">
              <li>
                <Link
                  href="/about"
                  className="flex min-h-12 items-center rounded-2xl px-4 py-4 text-lg font-medium leading-normal tracking-tight text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 active:bg-white/5"
                  onClick={closeMobileMenu}
                >
                  {t.landing.about}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}
