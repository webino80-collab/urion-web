"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HeroSlide } from "@/lib/hero-types";

const IMAGE_DURATION_MS = 8000;

type HeroBackdropProps = {
  slides: HeroSlide[];
};

export function HeroBackdrop({ slides }: HeroBackdropProps) {
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  if (count === 0) return null;

  const slide = slides[activeIndex]!;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/65" />
      {slide.kind === "video" ? (
        // 배경 영상은 항상 무음 (autoplay 정책 대응)
        <video
          key={slide.id}
          className="absolute inset-0 h-full w-full scale-105 object-cover opacity-90"
          src={slide.url}
          muted
          playsInline
          autoPlay
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

      <div className="absolute bottom-28 left-0 right-0 flex flex-col items-center gap-2 sm:bottom-32">
        <span className="rounded-full border border-white/15 bg-black/50 px-3 py-1 text-xs font-medium tabular-nums text-zinc-100 backdrop-blur-md">
          {activeIndex + 1} / {count}
        </span>
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
