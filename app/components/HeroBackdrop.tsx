"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { HeroSlide } from "@/lib/hero-types";

const IMAGE_DURATION_MS = 8000;
/** Tailwind `lg` 미만 = 모바일·태블릿 히어로 영상 (`mobileUrl`) */
const MOBILE_HERO_MQ = "(max-width: 1023px)";

function useHeroVideoSrc(slide: HeroSlide | null): string {
  const [src, setSrc] = useState(slide?.url ?? "");

  useLayoutEffect(() => {
    if (!slide) {
      setSrc("");
      return;
    }
    if (slide.kind !== "video") {
      setSrc(slide.url);
      return;
    }
    const mq = window.matchMedia(MOBILE_HERO_MQ);
    const sync = () => {
      setSrc(mq.matches && slide.mobileUrl ? slide.mobileUrl : slide.url);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [slide?.id, slide?.kind, slide?.url, slide?.mobileUrl]);

  if (!slide) return "";
  return slide.kind === "video" ? src : slide.url;
}

type HeroBackdropProps = {
  slides: HeroSlide[];
};

export function HeroBackdrop({ slides }: HeroBackdropProps) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 모바일 Safari 등: `autoPlay` 속성만으로는 무음 영상도 재생이 거절되는 경우가 있어 `play()`를 명시 호출 */
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  const activeIndex = count === 0 ? 0 : Math.min(index, count - 1);

  const goNext = useCallback(() => {
    if (count <= 1) return;
    setIndex((i) => {
      const cur = Math.min(i, count - 1);
      return (cur + 1) % count;
    });
  }, [count]);

  useEffect(() => {
    if (count <= 1) return;
    const cur = slides[activeIndex];
    if (!cur || cur.kind === "video") return;

    timerRef.current = setTimeout(goNext, IMAGE_DURATION_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [activeIndex, slides, count, goNext]);

  const slide = count === 0 ? null : slides[activeIndex]!;
  const videoSrc = useHeroVideoSrc(slide);

  useEffect(() => {
    if (!slide || slide.kind !== "video") return;
    const v = heroVideoRef.current;
    if (!v) return;

    const ensurePlay = () => {
      v.muted = true;
      v.defaultMuted = true;
      v.volume = 0;
      void v.play().catch(() => undefined);
    };

    ensurePlay();
    v.addEventListener("loadeddata", ensurePlay);
    v.addEventListener("canplay", ensurePlay);
    return () => {
      v.removeEventListener("loadeddata", ensurePlay);
      v.removeEventListener("canplay", ensurePlay);
    };
  }, [slide, videoSrc]);

  if (count === 0 || !slide) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/65" />
      {slide.kind === "video" ? (
        // 배경 영상은 항상 무음 (autoplay 정책 대응)
        // `<source media>`는 비디오에서 브라우저별로 불안정 → 뷰포트에 맞는 단일 src 사용
        <video
          ref={heroVideoRef}
          key={`${slide.id}-${videoSrc}`}
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-90"
          src={videoSrc}
          muted
          playsInline
          preload="auto"
          autoPlay
          loop={count === 1}
          onLoadedMetadata={(e) => {
            e.currentTarget.muted = true;
            e.currentTarget.volume = 0;
          }}
          onPlay={(e) => {
            e.currentTarget.muted = true;
            e.currentTarget.volume = 0;
          }}
          onVolumeChange={(e) => {
            e.currentTarget.muted = true;
            e.currentTarget.volume = 0;
          }}
          onEnded={() => {
            if (count > 1) goNext();
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- 동적 URL·GIF·webp 등 비최적화 원본
        <img
          key={slide.id}
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-90"
          src={slide.url}
          alt=""
          decoding="async"
        />
      )}

      <div className="absolute bottom-[30px] left-0 right-0 flex flex-col items-center gap-3">
        <svg
          width={32}
          height={44}
          viewBox="0 0 32 44"
          fill="none"
          className="text-white/55 drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]"
          aria-hidden
        >
          <rect
            x="1.5"
            y="1.5"
            width="29"
            height="41"
            rx="14.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity={0.65}
          />
          <g transform="translate(16, 12)">
            <circle
              cx={0}
              cy={0}
              r="2.5"
              fill="currentColor"
              className="hero-scroll-wheel-dot"
            />
          </g>
        </svg>
        {count > 1 ? (
          <div className="flex gap-1.5">
            {slides.map((s, i) => (
              <span
                key={s.id}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i === activeIndex ? "bg-white" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
