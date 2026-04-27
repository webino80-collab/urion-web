"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import type { Messages } from "@/lib/i18n/dictionaries";
import { useI18n } from "./I18nProvider";
import { PinGifPlayer } from "./PinGifPlayer";

/**
 * TPF 섹션 — 반응형 규약
 * - **PC(고정 기준)**: `lg`(≥1024px) 이상에서 확정된 레이아웃·타이포. 여기 손댈 땐 PC 너비에서 회귀 확인.
 * - **모바일**: `< lg` — 상단 h2·배경 유지, 본문은 **세로 스크롤 한 열**(개요 → 장점 → 수지 → 다중비아 순).
 * - 공통 상수(`tpfDiscListCore` 등)를 바꿀 때는 모바일·PC 둘 다 확인.
 *
 * 그리드 최대 너비(디자인 기준 1920) — PC 3열: 장점 | 개요·pin | 수지·tech01·다중비아
 */
const CONTENT_MAX = "min(100%,1920px)";

const HERO_BG = "/bg.webp";
const HERO_BG_POSITION = "center 30%";

const tpfHeadingClass =
  "font-sans text-[22px] font-bold leading-snug tracking-tight text-white";

/**
 * TPF 메인 헤드라인 — 보라→핑크 그라데이션 + 은은한 발광(어두운 배경·기술 패턴 위 가독성·계층감).
 * `bg-clip-text`는 제목 전용이며, 본문 디스크 리스트 등에는 사용하지 않음.
 */
const tpfMainHeadlineVisualClass =
  "bg-gradient-to-r from-[#F5EEFF] via-[#E879F9] to-[#FDA4AF] bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(232,121,249,0.22)] sm:drop-shadow-[0_0_36px_rgba(232,121,249,0.28)]";

const tpfDiscListCore =
  "list-outside list-disc space-y-4 pl-5 text-left text-[18px] font-normal leading-[1.6] break-keep text-white marker:text-white sm:space-y-5 sm:pl-5 [&>li]:pl-0.5";

/** 장점 목록: 항목 간 `space-y` 대신 패딩 + 구분선으로 구획 */
const tpfAdvantagesListClass =
  "list-outside list-disc pl-5 text-left text-[18px] font-normal leading-[1.6] break-keep text-white marker:text-white sm:pl-5 [&>li]:pl-0.5";

/** `list-outside` + 상위 `overflow-hidden`(아코디언 애니메이션)이면 iOS에서 번호 마커가 잘림 → `list-inside` */
const tpfNumberedSublistCoreClass =
  "list-inside list-decimal space-y-1.5 pl-4 text-left text-[14px] font-normal leading-[1.6] break-keep text-zinc-400 marker:text-zinc-500 sm:space-y-2 sm:pl-5";

type TpfDict = Messages["tpf"];

function idMobile(base: string, mobile: boolean) {
  return mobile ? `${base}-m` : base;
}

function TextColumn({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden ${className}`}
    >
      {children}
    </div>
  );
}

function TpfTitleRow({ children }: { children: ReactNode }) {
  return <div className="min-w-0">{children}</div>;
}

const tpfMobileScrollHide =
  "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0";

/** 모바일 세로 스크롤 본문 안의 한 블록 (구 가로 슬라이드 1칸 분량). 상단 구분선은 부모의 `[&>section+section]`으로만 줌(첫 블록은 제목 div 뒤라 `first:` 불가). */
function TpfMobileScrollBlock({ children }: { children: ReactNode }) {
  return (
    <section className="px-6 py-10 sm:px-10 sm:py-12">{children}</section>
  );
}

function TpfOverviewContent({ p, mobile }: { p: TpfDict; mobile: boolean }) {
  const hid = idMobile("tpf-overview-heading", mobile);
  return (
    <>
      <TpfTitleRow>
        <h3 id={hid} className={tpfHeadingClass}>
          {p.overviewTitle}
        </h3>
        <ul
          className={`mt-5 sm:mt-6 ${tpfDiscListCore}`}
          aria-labelledby={hid}
        >
          {p.overviewBullets.map((line, i) => (
            <li key={`ov-${mobile ? "m" : "d"}-${i}`} className="whitespace-pre-line">
              {line}
            </li>
          ))}
        </ul>
      </TpfTitleRow>
      <div className="mt-[20px] flex min-h-0 flex-1 items-start justify-start max-lg:mt-6 max-lg:flex-none max-lg:min-h-0">
        <div className="flex max-h-full w-full max-w-[min(100%,26rem)] items-start justify-start overflow-hidden p-3 sm:p-4 max-lg:max-h-none max-lg:max-w-none max-lg:justify-center">
          <PinGifPlayer
            src="/pin.gif"
            alt={p.pinGifAlt}
            className="max-h-[min(22dvh,14rem)] w-auto max-w-full object-contain sm:max-h-[min(26dvh,16rem)] lg:max-h-[min(30dvh,17rem)]"
          />
        </div>
      </div>
    </>
  );
}

function TpfAdvantagesContent({ p, mobile }: { p: TpfDict; mobile: boolean }) {
  const hid = idMobile("tpf-advantages-heading", mobile);
  /** 하위 목록이 있는 항목: `+`로 접기/펼치기, 한 번에 하나만 열림 (`null` = 전부 닫힘) */
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <TpfTitleRow>
      <h3 id={hid} className={tpfHeadingClass}>
        {p.advantagesTitle}
      </h3>
      <ul
        className={`mt-5 sm:mt-6 ${tpfAdvantagesListClass} ${mobile ? "" : "min-h-0 flex-1 overflow-hidden"}`}
        aria-labelledby={hid}
      >
        {p.advantagesItems.map((item, i) => {
          const subId = `adv-sub-${mobile ? "m" : "d"}-${i}`;
          const hasSubs = item.subpoints.length > 0;
          const expanded = hasSubs && openIndex === i;
          /** 희미한 가로 구분선 — 모바일 섹션 구분선(`border-white/10`)과 동일 톤 */
          const advItemSep =
            i === 0 ? "pb-4 sm:pb-5" : "border-t border-white/10 pt-4 pb-4 sm:pt-5 sm:pb-5";

          return (
            <li key={`adv-${mobile ? "m" : "d"}-${i}`} className={advItemSep}>
              {hasSubs ? (
                <button
                  type="button"
                  className="flex min-h-12 w-full items-center justify-between gap-3 rounded-sm py-2 text-left text-[18px] font-normal leading-[1.6] text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70"
                  aria-expanded={expanded}
                  aria-controls={subId}
                  onClick={() =>
                    setOpenIndex((cur) => (cur === i ? null : i))
                  }
                >
                  <span className="min-w-0 flex-1 whitespace-pre-line pr-1">
                    {item.heading}
                  </span>
                  <span
                    className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/35 text-base font-semibold leading-none text-white transition-colors hover:border-white/55 tabular-nums sm:size-12"
                    aria-hidden
                  >
                    {expanded ? "−" : "+"}
                  </span>
                </button>
              ) : (
                <p className="whitespace-pre-line text-[18px] font-normal leading-[1.6] text-white">
                  {item.heading}
                </p>
              )}
              {hasSubs ? (
                <div
                  className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="pt-2.5 sm:pt-3">
                      <ol
                        id={subId}
                        className={tpfNumberedSublistCoreClass}
                        aria-hidden={!expanded}
                      >
                        {item.subpoints.map((line, j) => (
                          <li key={`adv-${mobile ? "m" : "d"}-${i}-sub-${j}`}>
                            {line}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </TpfTitleRow>
  );
}

function TpfResinContent({ p, mobile }: { p: TpfDict; mobile: boolean }) {
  const hid = idMobile("tpf-resin-heading", mobile);
  return (
    <TpfTitleRow>
      <h3 id={hid} className={tpfHeadingClass}>
        {p.resinTitle}
      </h3>
      <ul className={`mt-5 sm:mt-6 ${tpfDiscListCore}`} aria-labelledby={hid}>
        {p.resinBullets.map((line, i) => (
          <li key={`${mobile ? "m" : "d"}-resin-${i}`}>{line}</li>
        ))}
      </ul>
      <div
        className={`relative h-[min(16dvh,9rem)] w-full max-w-lg shrink-0 overflow-hidden sm:h-[min(18dvh,10rem)] lg:h-[min(20dvh,10.5rem)] xl:h-[min(22dvh,11.5rem)] max-lg:mx-auto max-lg:max-w-none ${
          mobile ? "my-[20px]" : "mt-0"
        }`}
      >
        <Image
          src="/tech01.webp"
          alt={p.tech01Alt}
          fill
          className="border-0 object-contain px-3 sm:px-4 py-0"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      </div>
    </TpfTitleRow>
  );
}

function TpfMultiViaContent({ p, mobile }: { p: TpfDict; mobile: boolean }) {
  const hid = idMobile("tpf-pin-heading", mobile);
  return (
    <TpfTitleRow>
      <h3 id={hid} className={tpfHeadingClass}>
        {p.pinTitle}
      </h3>
      <ul className={`mt-5 sm:mt-6 ${tpfDiscListCore}`} aria-labelledby={hid}>
        {p.pinProcessBullets.map((line, i) => (
          <li key={`pin-${mobile ? "m" : "d"}-${i}`} className="whitespace-pre-line">
            {line}
          </li>
        ))}
      </ul>
    </TpfTitleRow>
  );
}

function TpfMainHeading({ p }: { p: TpfDict }) {
  return (
    <div className="w-full max-w-[min(90%,52rem)]">
      <h2
        className={`text-left font-sans text-[32px] font-light leading-[1.22] tracking-[0.035em] sm:tracking-[0.04em] lg:text-center lg:text-[34px] xl:text-[36px] ${tpfMainHeadlineVisualClass}`}
      >
        {p.title}
      </h2>
      {/* 시선 마무리용 얇은 악센트 라인 — 중앙 정렬 구간과 모바일 좌측 정렬 모두 대응 */}
      <div
        className="mt-5 h-px max-w-[5rem] bg-gradient-to-r from-violet-400/60 via-fuchsia-400/80 to-pink-300/55 sm:mt-6 sm:max-w-[6rem] lg:mx-auto lg:mt-7"
        aria-hidden
      />
    </div>
  );
}

export function TpfProcessSection() {
  const { t } = useI18n();
  const p = t.tpf;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden bg-black font-sans text-white">
      {/* PC만: 섹션 높이(h-dvh)에 맞춰 고정 배경. 모바일은 아래 스크롤 래퍼 안에서 같이 움직임 */}
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden bg-cover bg-no-repeat lg:block"
        style={{
          backgroundImage: `url("${HERO_BG}")`,
          backgroundPosition: HERO_BG_POSITION,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-[1] hidden bg-gradient-to-b from-black/30 via-black/65 to-black/[0.93] lg:block"
        aria-hidden
      />
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {/* 모바일: 제목 + 본문 한 덩어리로 세로 스크롤 */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:hidden">
          <div
            data-tpf-mobile-scroll
            className={`min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[max(1rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch] ${tpfMobileScrollHide}`}
            role="region"
            aria-label={p.title}
          >
            {/* 배경은 고정 slab만 `cover`+`center 30%`(PC와 동일). 전체 스크롤 높이에 맞추면 확대·잘림; 100dvh만 두면 GIF 아래가 검게 끊김 → slab을 약간 키움 */}
            <div className="relative isolate w-full">
              <div
                className="pointer-events-none absolute left-0 right-0 top-0 z-0 h-[min(132dvh,920px)] bg-cover bg-no-repeat"
                style={{
                  backgroundImage: `url("${HERO_BG}")`,
                  backgroundPosition: HERO_BG_POSITION,
                }}
                aria-hidden
              />
              <div className="pointer-events-none absolute left-0 right-0 top-0 z-[1] h-[min(132dvh,920px)] bg-gradient-to-b from-black/30 via-black/65 to-black/[0.93]" aria-hidden />
              <div className="relative z-10 [&>section+section]:border-t [&>section+section]:border-white/10">
                <div className="flex flex-col items-start px-6 pb-6 pt-[calc(env(safe-area-inset-top)+5.5rem+60px)] sm:px-10 sm:pb-8">
                  <TpfMainHeading p={p} />
                </div>
                <TpfMobileScrollBlock>
                  <TpfOverviewContent p={p} mobile />
                </TpfMobileScrollBlock>
                <TpfMobileScrollBlock>
                  <TpfAdvantagesContent p={p} mobile />
                </TpfMobileScrollBlock>
                <TpfMobileScrollBlock>
                  <TpfResinContent p={p} mobile />
                </TpfMobileScrollBlock>
                <TpfMobileScrollBlock>
                  <TpfMultiViaContent p={p} mobile />
                </TpfMobileScrollBlock>
              </div>
            </div>
          </div>
        </div>

        {/* PC: 상단 제목 고정 + 그리드만 스크롤 */}
        <div className="hidden min-h-0 flex-1 flex-col overflow-hidden lg:flex">
          <div className="flex shrink-0 flex-col items-start justify-start px-5 pb-6 sm:px-6 sm:pb-8 lg:items-center lg:px-8 lg:pb-8 lg:pt-[120px] xl:px-12">
            <TpfMainHeading p={p} />
          </div>
          {/* 상단부터 쌓기(`justify-start`) — 세로 중앙 정렬 시 하단 빈 여백이 과하게 보임 */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:justify-start">
            {/* 스크롤 영역과 그리드 분리: 행을 뷰포트 높이로 늘리지 않고 `items-start`로 세 열 h3 상단선을 맞춤 */}
            <div
              className="mx-auto flex min-h-0 w-full flex-1 flex-col overflow-y-auto px-5 pt-4 pb-4 sm:px-8 sm:pt-5 sm:pb-5 lg:px-10 lg:pt-6 lg:pb-4 xl:px-14 xl:pt-7 xl:pb-5"
              style={{ maxWidth: CONTENT_MAX }}
            >
              <div className="grid w-full grid-cols-3 items-start gap-8 sm:gap-10 lg:gap-12 xl:gap-16">
                <article className="flex min-h-0 flex-col overflow-hidden lg:pl-8 lg:pr-4 xl:pl-12 xl:pr-6">
                  <TextColumn>
                    <TpfAdvantagesContent p={p} mobile={false} />
                  </TextColumn>
                </article>

                <article className="flex min-h-0 flex-col overflow-hidden lg:px-6 xl:px-8">
                  <TextColumn>
                    <TpfOverviewContent p={p} mobile={false} />
                  </TextColumn>
                </article>

                <article className="flex min-h-0 flex-col overflow-hidden lg:pl-4 lg:pr-8 xl:pl-6 xl:pr-12">
                  <TextColumn>
                    <TpfResinContent p={p} mobile={false} />
                    <div className="mt-[52px] sm:mt-[60px]">
                      <TpfMultiViaContent p={p} mobile={false} />
                    </div>
                  </TextColumn>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
