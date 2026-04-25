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

/** 어두운 배경 + 얇은 웨이트에서도 잘 보이도록 밝은 보라 → 핑크 톤 */
const preLeadingTitleGradientClass =
  "bg-gradient-to-r from-[#E9D5FF] via-[#E879F9] to-[#FDA4AF] bg-clip-text text-transparent";

function titleStartsWithPre(text: string) {
  return text.toUpperCase().startsWith("PRE");
}

const tpfDiscListCore =
  "list-outside list-disc space-y-4 pl-5 text-left text-[18px] font-normal leading-[1.6] break-keep text-white marker:text-white sm:space-y-5 sm:pl-5 [&>li]:pl-0.5";

/** `list-outside` + 상위 `overflow-hidden`(아코디언 애니메이션)이면 iOS에서 번호 마커가 잘림 → `list-inside` */
const tpfNumberedSublistCoreClass =
  "list-inside list-decimal space-y-1.5 pl-4 text-left text-[18px] font-normal leading-[1.6] break-keep text-zinc-400 marker:text-zinc-500 sm:space-y-2 sm:pl-5";

const tpfNumberedSublistClass =
  `mt-2.5 sm:mt-3 ${tpfNumberedSublistCoreClass}`;

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
    <section className="px-5 py-10 sm:px-6 sm:py-12">{children}</section>
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
  /** 모바일 하위 목록: 한 번에 하나만 열림 (`null` = 전부 닫힘) */
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <TpfTitleRow>
      <h3 id={hid} className={tpfHeadingClass}>
        {p.advantagesTitle}
      </h3>
      <ul
        className={`mt-5 sm:mt-6 ${tpfDiscListCore} ${mobile ? "" : "min-h-0 flex-1 overflow-hidden"}`}
        aria-labelledby={hid}
      >
        {p.advantagesItems.map((item, i) => {
          const subId = `adv-sub-${mobile ? "m" : "d"}-${i}`;
          const hasSubs = item.subpoints.length > 0;
          const expanded = mobile && hasSubs ? openIndex === i : true;

          return (
            <li key={`adv-${mobile ? "m" : "d"}-${i}`}>
              {mobile && hasSubs ? (
                <button
                  type="button"
                  className="flex min-h-12 w-full items-start justify-between gap-3 rounded-sm py-2 text-left text-[18px] font-normal leading-[1.6] text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/70"
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
                    className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-sm text-lg font-semibold leading-none text-zinc-200 tabular-nums"
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
              {hasSubs && mobile ? (
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
              ) : hasSubs ? (
                <ol id={subId} className={tpfNumberedSublistClass}>
                  {item.subpoints.map((line, j) => (
                    <li key={`adv-${mobile ? "m" : "d"}-${i}-sub-${j}`}>
                      {line}
                    </li>
                  ))}
                </ol>
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
        <li>{p.resinBullets[0]}</li>
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
      <ul className={`mt-0 ${tpfDiscListCore}`} aria-labelledby={hid}>
        <li>{p.resinBullets[1]}</li>
      </ul>
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

function TpfMainHeading({
  p,
  titleGradient,
}: {
  p: TpfDict;
  titleGradient: boolean;
}) {
  return (
    <h2
      className={`w-full max-w-[min(90%,52rem)] text-left font-sans text-[32px] font-extralight leading-[1.15] tracking-[0.06em] lg:text-center lg:text-[48px] ${
        titleGradient ? preLeadingTitleGradientClass : "text-white"
      }`}
    >
      {p.title}
    </h2>
  );
}

type TpfProcessSectionProps = {
  /** 모바일 세로 스크롤 래퍼 — 랜딩 헤더 배경(스크롤 시만) 연동용 */
  onMobileScrollRegionScroll?: (scrollTop: number) => void;
};

export function TpfProcessSection({
  onMobileScrollRegionScroll,
}: TpfProcessSectionProps) {
  const { t } = useI18n();
  const p = t.tpf;
  const titleGradient = titleStartsWithPre(p.title);

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
            onScroll={(e) =>
              onMobileScrollRegionScroll?.(e.currentTarget.scrollTop)
            }
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
                <div className="flex flex-col items-start px-5 pb-6 pt-[calc(env(safe-area-inset-top)+5.5rem+60px)] sm:px-6 sm:pb-8">
                  <TpfMainHeading p={p} titleGradient={titleGradient} />
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
          <div className="flex shrink-0 flex-col items-start justify-start px-5 pb-8 sm:px-6 sm:pb-10 lg:items-center lg:px-8 lg:pb-12 lg:pt-[120px] xl:px-12">
            <TpfMainHeading p={p} titleGradient={titleGradient} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:justify-center">
            <div
              className="mx-auto grid h-full min-h-0 w-full max-h-full grid-cols-3 gap-8 overflow-y-auto px-5 py-5 sm:gap-10 sm:px-6 sm:py-6 lg:gap-12 lg:px-4 lg:py-8 xl:gap-16 xl:py-10"
              style={{ maxWidth: CONTENT_MAX }}
            >
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
  );
}
