"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { fetchHeroSlides } from "@/lib/hero-fetch";
import type { HeroSlide } from "@/lib/hero-types";
import { ContactSection } from "./ContactSection";
import { HeroBackdrop } from "./HeroBackdrop";
import { TpfProcessSection } from "./TpfProcessSection";
// import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "./I18nProvider";

/** 풀페이지 슬라이드 수(히어로 + 더미1 + 문의/푸터) — 섹션 추가 시 여기만 맞추면 됨 */
const FULL_PAGE_SECTION_COUNT = 3;

/** 문의 등 내부 스크롤 영역이 휠을 먹을 수 있으면 풀페이지 슬라이드로 넘기지 않음 */
function wheelTargetAllowsVerticalScroll(
  target: EventTarget | null,
  deltaY: number,
): boolean {
  let el = target as HTMLElement | null;
  for (; el && el !== document.documentElement; el = el.parentElement) {
    const cs = window.getComputedStyle(el);
    const oy = cs.overflowY;
    if (oy !== "auto" && oy !== "scroll" && oy !== "overlay") continue;
    if (el.scrollHeight <= el.clientHeight + 1) continue;
    const st = el.scrollTop;
    const max = el.scrollHeight - el.clientHeight;
    if (deltaY > 0 && st < max) return true;
    if (deltaY < 0 && st > 0) return true;
  }
  return false;
}

/** 가로 스크롤(overflow-x)이 deltaX 방향으로 더 움직일 수 있으면 true */
function wheelTargetAllowsHorizontalScroll(
  target: EventTarget | null,
  deltaX: number,
): boolean {
  let el = target as HTMLElement | null;
  for (; el && el !== document.documentElement; el = el.parentElement) {
    const cs = window.getComputedStyle(el);
    const ox = cs.overflowX;
    if (ox !== "auto" && ox !== "scroll" && ox !== "overlay") continue;
    if (el.scrollWidth <= el.clientWidth + 1) continue;
    const st = el.scrollLeft;
    const max = el.scrollWidth - el.clientWidth;
    if (deltaX > 0 && st < max) return true;
    if (deltaX < 0 && st > 0) return true;
  }
  return false;
}

/** 터치: 손가락 위로(dy>0) ≈ 휠 아래로(deltaY>0). 내부 스크롤이 더 내려갈 수 있으면 슬라이드 전환하지 않음 */
function touchTargetAllowsVerticalScroll(
  target: EventTarget | null,
  dy: number,
): boolean {
  if (dy === 0) return false;
  const syntheticDelta = dy > 0 ? 80 : -80;
  return wheelTargetAllowsVerticalScroll(target, syntheticDelta);
}

/** 터치: 손가락 왼쪽으로(dx>0) ≈ scrollLeft 증가 방향 */
function touchTargetAllowsHorizontalScroll(
  target: EventTarget | null,
  dx: number,
): boolean {
  if (dx === 0) return false;
  const syntheticDelta = dx > 0 ? 80 : -80;
  return wheelTargetAllowsHorizontalScroll(target, syntheticDelta);
}

const SLIDE_DURATION_MS = 700;
const WHEEL_DELTA_THRESHOLD = 40;
const SWIPE_PX_THRESHOLD = 56;
/** 모바일(`max-lg`): 히어로는 헤더 배경 없음 — 내부 스크롤이 이 값(px)을 넘기면 반투명 헤더 표시 */
const MOBILE_HEADER_FILL_SCROLL_THRESHOLD_PX = 24;

export function Landing() {
  const { t } = useI18n();
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  /** `max-lg` 전용: 히어로 제외, 스크롤 깊이에 따라 헤더 반투명 배경 */
  const [mobileHeaderFill, setMobileHeaderFill] = useState(false);
  const slideLockRef = useRef(false);
  const slideIndexRef = useRef(0);
  const contactScrollRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    slideIndexRef.current = slideIndex;
  }, [slideIndex]);

  const syncMobileHeaderFillFromScroll = useCallback(() => {
    const i = slideIndexRef.current;
    if (i === 0) {
      setMobileHeaderFill(false);
      return;
    }
    if (i === 1) {
      const el = document.querySelector<HTMLElement>(
        "[data-tpf-mobile-scroll]",
      );
      setMobileHeaderFill(
        !!el && el.scrollTop > MOBILE_HEADER_FILL_SCROLL_THRESHOLD_PX,
      );
      return;
    }
    if (i === 2) {
      const el = contactScrollRef.current;
      setMobileHeaderFill(
        !!el && el.scrollTop > MOBILE_HEADER_FILL_SCROLL_THRESHOLD_PX,
      );
    }
  }, []);

  useEffect(() => {
    if (slideIndex === 0) {
      setMobileHeaderFill(false);
      return;
    }
    const id = requestAnimationFrame(() => syncMobileHeaderFillFromScroll());
    return () => cancelAnimationFrame(id);
  }, [slideIndex, syncMobileHeaderFillFromScroll]);

  useEffect(() => {
    if (slideIndex !== 2) return;
    const el = contactScrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (slideIndexRef.current !== 2) return;
      setMobileHeaderFill(
        el.scrollTop > MOBILE_HEADER_FILL_SCROLL_THRESHOLD_PX,
      );
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [slideIndex]);

  const onTpfMobileScrollRegionScroll = useCallback(
    (scrollTop: number) => {
      if (slideIndexRef.current !== 1) return;
      setMobileHeaderFill(
        scrollTop > MOBILE_HEADER_FILL_SCROLL_THRESHOLD_PX,
      );
    },
    [],
  );

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  useEffect(() => {
    const ac = new AbortController();
    fetchHeroSlides(ac.signal).then(({ slides }) => {
      if (!ac.signal.aborted) setHeroSlides(slides);
    });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const goSlide = useCallback((direction: 1 | -1) => {
    if (slideLockRef.current) return;
    const i = slideIndexRef.current;
    const next = i + direction;
    if (next < 0 || next >= FULL_PAGE_SECTION_COUNT) return;
    slideLockRef.current = true;
    slideIndexRef.current = next;
    setSlideIndex(next);
    window.setTimeout(() => {
      slideLockRef.current = false;
    }, SLIDE_DURATION_MS);
  }, []);

  const goSlideTo = useCallback((index: number) => {
    if (slideLockRef.current) return;
    const clamped = Math.max(
      0,
      Math.min(FULL_PAGE_SECTION_COUNT - 1, index),
    );
    if (slideIndexRef.current === clamped) return;
    slideLockRef.current = true;
    slideIndexRef.current = clamped;
    setSlideIndex(clamped);
    window.setTimeout(() => {
      slideLockRef.current = false;
    }, SLIDE_DURATION_MS);
  }, []);

  const goToContactSlide = useCallback(() => {
    setMobileMenuOpen(false);
    goSlideTo(FULL_PAGE_SECTION_COUNT - 1);
  }, [goSlideTo]);

  const goHome = useCallback(() => {
    setMobileMenuOpen(false);
    goSlideTo(0);
  }, [goSlideTo]);

  /** fullPage.js 스타일: 휠 한 번(임계 이상)당 한 섹션 — 문서 스크롤과 분리 */
  useEffect(() => {
    if (mobileMenuOpen) return;

    const onWheel = (e: WheelEvent) => {
      if (
        Math.abs(e.deltaX) > Math.abs(e.deltaY) &&
        Math.abs(e.deltaX) >= WHEEL_DELTA_THRESHOLD
      ) {
        if (wheelTargetAllowsHorizontalScroll(e.target, e.deltaX)) return;
        return;
      }
      if (Math.abs(e.deltaY) < WHEEL_DELTA_THRESHOLD) return;
      if (wheelTargetAllowsVerticalScroll(e.target, e.deltaY)) return;
      e.preventDefault();
      e.stopPropagation();
      if (slideLockRef.current) return;
      if (e.deltaY > 0) goSlide(1);
      else goSlide(-1);
    };

    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () =>
      window.removeEventListener("wheel", onWheel, { capture: true });
  }, [goSlide, mobileMenuOpen]);

  useEffect(() => {
    if (mobileMenuOpen) return;

    const onKey = (e: KeyboardEvent) => {
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
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        goSlide(1);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        goSlide(-1);
      } else if (e.key === "Home") {
        e.preventDefault();
        goSlideTo(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goSlideTo(FULL_PAGE_SECTION_COUNT - 1);
      }
    };

    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [goSlide, goSlideTo, mobileMenuOpen]);

  /** 레거시: Spline 워터마크 가림용 하단 좌·우 검은 박스(div)가 DOM에 남아 있으면 제거 */
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

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (mobileMenuOpen) return;
    if (touchStartY.current == null || touchStartX.current == null) return;
    const y = e.changedTouches[0]?.clientY;
    const x = e.changedTouches[0]?.clientX;
    if (y == null || x == null) return;
    const dy = touchStartY.current - y;
    const dx = touchStartX.current - x;
    touchStartY.current = null;
    touchStartX.current = null;

    const hThresh = SWIPE_PX_THRESHOLD * 0.65;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= hThresh) {
      if (touchTargetAllowsHorizontalScroll(e.target, dx)) return;
      return;
    }

    if (dy > SWIPE_PX_THRESHOLD) {
      if (touchTargetAllowsVerticalScroll(e.target, dy)) return;
      goSlide(1);
    } else if (dy < -SWIPE_PX_THRESHOLD) {
      if (touchTargetAllowsVerticalScroll(e.target, dy)) return;
      goSlide(-1);
    }
  };

  const durationMs = reduceMotion ? 0 : SLIDE_DURATION_MS;

  return (
    <>
      {/* 상단 고정: 슬라이드 전환 시에도 동일 위치 */}
      <header
        className={`pointer-events-auto fixed inset-x-0 top-0 z-[90] flex items-center justify-between gap-4 px-6 py-4 pt-[max(1rem,env(safe-area-inset-top))] transition-[background-color,border-color,backdrop-filter] duration-300 sm:px-10 lg:border-b lg:border-white/[0.07] lg:bg-zinc-950/80 lg:backdrop-blur-md lg:backdrop-saturate-150 ${
          mobileHeaderFill
            ? "max-lg:border-b max-lg:border-white/[0.07] max-lg:bg-zinc-950/80 max-lg:backdrop-blur-md max-lg:backdrop-saturate-150"
            : "max-lg:border-b max-lg:border-transparent max-lg:bg-transparent max-lg:backdrop-blur-none"
        }`}
      >
        <button
          type="button"
          onClick={goHome}
          className="inline-flex min-h-12 cursor-pointer items-center px-2 text-left text-sm font-bold tracking-[0.2em] text-zinc-300 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent max-lg:px-0"
          aria-label={t.landing.logoHomeAria}
        >
          U:RION
        </button>
        <div className="flex flex-wrap items-center justify-end gap-4 sm:gap-6">
          {/* 언어 토글 (한국어 / English) — 필요 시 위 LanguageSwitcher import 주석 해제 후 아래 주석 해제
            <LanguageSwitcher />
            */}
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
            <button
              type="button"
              onClick={goToContactSlide}
              className="inline-flex min-h-12 items-center rounded-sm px-2 text-zinc-200 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            >
              {t.landing.contactUs}
            </button>
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

      {/* 한 뷰포트 클립 + 세로 슬라이드 스트립 (fullPage.js 유사) */}
      <div
        className="relative z-20 h-dvh w-full overflow-hidden bg-black"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="presentation"
      >
        <div
          className="flex w-full flex-col will-change-transform"
          style={{
            height: `calc(${FULL_PAGE_SECTION_COUNT} * 100dvh)`,
            transform: `translate3d(0, calc(${-slideIndex} * 100dvh), 0)`,
            transitionProperty: "transform",
            transitionDuration: `${durationMs}ms`,
            transitionTimingFunction: "cubic-bezier(0.33, 1, 0.68, 1)",
          }}
        >
          <section
            id="hero"
            aria-label="Hero"
            className="relative isolate flex h-dvh min-h-0 shrink-0 flex-col overflow-hidden bg-black text-zinc-100 max-lg:pt-[calc(env(safe-area-inset-top)+5.5rem+140px)] lg:pt-0"
          >
            <HeroBackdrop slides={heroSlides} />

            <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center px-6 pb-24 pt-2 max-lg:pt-0 sm:px-10 sm:pb-28">
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
          </section>

          <section
            id="tpf-process"
            className="relative flex h-dvh min-h-0 shrink-0 flex-col overflow-hidden bg-black"
            aria-label={t.tpf.ariaLabel}
          >
            <TpfProcessSection
              onMobileScrollRegionScroll={onTpfMobileScrollRegionScroll}
            />
          </section>

          <section
            id="contact"
            className="flex h-dvh shrink-0 flex-col overflow-hidden border-t border-white/10 bg-zinc-950"
            aria-label={t.contact.title}
          >
            <div
              ref={contactScrollRef}
              className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain px-6 pb-3 pt-[max(5.5rem,env(safe-area-inset-top)+3.5rem)] sm:px-10 sm:pb-4 sm:pt-[max(6rem,env(safe-area-inset-top)+4rem)]"
            >
              <ContactSection />
              <footer className="mt-auto shrink-0 border-t border-white/10 pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pt-5 sm:pb-[max(1rem,env(safe-area-inset-bottom))]">
                <p className="text-center text-xs text-zinc-500 sm:text-sm">
                  © {new Date().getFullYear()}{" "}
                  <span className="font-bold text-zinc-400">U:RION</span>
                </p>
              </footer>
            </div>
          </section>
        </div>
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label={t.about.closeAria}
            onClick={closeMobileMenu}
          />
          <nav
            id="landing-mobile-nav"
            className="relative flex h-full w-[min(100%,20rem)] flex-col border-l border-white/10 bg-zinc-950/95 px-6 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] shadow-[-12px_0_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
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
              <li>
                <button
                  type="button"
                  className="flex min-h-12 w-full items-center rounded-2xl px-4 py-4 text-left text-lg font-medium leading-normal tracking-tight text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 active:bg-white/5"
                  onClick={goToContactSlide}
                >
                  {t.landing.contactUs}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}

    </>
  );
}
