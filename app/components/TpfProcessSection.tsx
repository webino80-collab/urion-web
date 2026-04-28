"use client";

import { useState } from "react";
import Image from "next/image";
import {
  MAX_CONTENT_WIDTH_PX,
  TPF_DIAGRAM_MAX_CSS_PX,
} from "@/lib/design-tokens";
import type { Messages } from "@/lib/i18n/dictionaries";
import { useI18n } from "./I18nProvider";
import { CeoMessageRichText } from "./CeoMessageRichText";
import { PinGifPlayer } from "./PinGifPlayer";

type TpfDict = Messages["tpf"];

const CONTAINER_CLASS =
  "mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-10";

/** 1200px 데스크톱; 이미지 에셋은 2x → `sizes`로 DPR 2에 맞는 요청 (논리 픽셀 기준) */
const SIZES_FULL_1200 = `(min-width: ${MAX_CONTENT_WIDTH_PX}px) ${MAX_CONTENT_WIDTH_PX}px, 100vw`;
const SIZES_DIAGRAM_1200 = `(min-width: ${MAX_CONTENT_WIDTH_PX}px) ${TPF_DIAGRAM_MAX_CSS_PX}px, (min-width: 768px) 85vw, 100vw`;
const SIZES_TPF_DECOR = "100vw";

const tpfH3 =
  "text-left font-sans text-[22px] font-bold leading-snug tracking-tight text-white";
const tpfBody =
  "list-outside list-disc pl-5 text-left text-lg font-normal leading-[1.6] break-keep text-zinc-100 marker:text-white sm:pl-5 [&>li]:pl-0.5";
const tpfSubNumbered =
  "list-inside list-decimal space-y-1.5 pl-3 text-left text-sm font-normal leading-[1.6] break-keep text-zinc-400 sm:pl-4";

function TpfAdvantagesList({ p }: { p: TpfDict }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <ul className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/50">
      {p.advantagesItems.map((item, i) => {
        const hasSubs = item.subpoints.length > 0;
        const expanded = hasSubs && openIndex === i;
        return (
          <li
            key={`adv-${i}`}
            className="border-b border-white/10 last:border-b-0"
          >
            {hasSubs ? (
              <>
                <div className="flex min-h-12 items-center gap-3 px-4 py-5 sm:min-h-14 sm:px-5 sm:py-5">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left text-lg font-normal leading-[1.6] text-white transition-[background-color] hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-violet-500/60"
                    aria-expanded={expanded}
                    onClick={() => {
                      if (!expanded) setOpenIndex(i);
                    }}
                  >
                    <span className="break-keep whitespace-pre-line pr-1">
                      {item.heading}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-white/30 text-lg font-light leading-none text-white tabular-nums transition-colors hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
                    aria-label={expanded ? "collapse item" : "expand item"}
                    onClick={() =>
                      setOpenIndex((cur) => (cur === i ? null : i))
                    }
                  >
                    {expanded ? "−" : "+"}
                  </button>
                </div>
                <div
                  className={`grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="min-h-0 overflow-hidden">
                    <ol
                      className={`border-t border-white/5 px-4 pb-5 pt-5 pl-[20px] sm:px-5 sm:pb-5 sm:pt-5 sm:pl-[20px] ${tpfSubNumbered}`}
                    >
                      {item.subpoints.map((line, j) => (
                        <li key={`adv-sub-${i}-${j}`}>{line}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 sm:min-h-14 sm:px-5 sm:py-4">
                <p className="min-w-0 flex-1 text-left text-lg font-normal leading-[1.6] break-keep text-white">
                  {item.heading}
                </p>
                <span
                  className="inline-flex size-10 shrink-0 items-center justify-center opacity-0"
                  aria-hidden
                >
                  +
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * 랜딩 히어로 바로 아래: CEO 라이트 톤 카드 → TGV 헤드라인 → TPF 개요(일러+텍스트) → 장점 아코디언 → 수지·다중비아.
 * · Max container 1200px / 태블릿·모바일 한 열 (워크스페이스 그리드 규약)
 */
export function TpfProcessSection() {
  const { t } = useI18n();
  const p = t.tpf;

  return (
    <div className="relative overflow-hidden bg-landing-page font-sans text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-30"
        aria-hidden
      >
        <Image
          src="/bg.webp"
          alt=""
          fill
          className="object-cover object-center"
          sizes={SIZES_TPF_DECOR}
          quality={80}
        />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-landing-page/45 via-landing-page/80 to-landing-page"
        aria-hidden
      />

      <div className="relative z-10">
        <div
          className={`${CONTAINER_CLASS} space-y-14 pb-12 pt-[100px] sm:space-y-20 sm:py-16 md:space-y-24 md:pb-20 md:pt-[160px]`}
          style={{ maxWidth: MAX_CONTENT_WIDTH_PX }}
        >
          <h2
            className="mb-8 text-left text-[32px] font-bold leading-10 tracking-[-0.02em] md:hidden"
            aria-label={`${p.ceoMessageTitleCeo} ${p.ceoMessageTitleMessage}`}
          >
            <span className="text-white">{p.ceoMessageTitleCeo}</span>
            <span className="text-[#B8B8B8]"> {p.ceoMessageTitleMessage}</span>
          </h2>
          <section
            className="relative overflow-hidden rounded-3xl border border-zinc-900/10 bg-transparent p-0 text-[#0f0f0f] sm:min-h-80"
            aria-labelledby="ceo-message-title"
          >
            {/*
              Figma 1200×480: 2열(텍스트 | 여백·캐릭터) — 그리드로 50% 텍스트 영역 고정, 배경 2x.
            */}
            <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
              <Image
                src="/ceo_bg.webp"
                alt=""
                fill
                className="object-cover object-[80%_center] md:object-right"
                sizes={SIZES_FULL_1200}
                quality={80}
                priority
              />
            </div>
            <div className="relative z-10 grid min-h-64 w-full [text-rendering:geometricPrecision] font-sans antialiased md:min-h-[480px] md:grid-cols-2">
              <div className="hidden w-full min-w-0 max-w-full flex-col justify-center px-5 py-6 sm:px-7 sm:py-7 md:flex md:px-0 md:py-0 md:pl-[72px] md:pr-4 lg:pl-20">
                <h2
                  id="ceo-message-title"
                  className="hidden text-left text-[32px] font-bold leading-10 tracking-[-0.02em] md:block"
                >
                  <span className="text-[#333333]">{p.ceoMessageTitleCeo}</span>
                  <span className="text-[#B8B8B8]">
                    {" "}
                    {p.ceoMessageTitleMessage}
                  </span>
                </h2>
                {/*
                  본문: JSON에 수동 \n 없음·`whitespace-normal` — 너비는 박스(`max-w`)에 맞춰 자동 분기
                */}
                <div className="mt-8 w-full min-w-0 max-w-full sm:max-w-[min(100%,30rem)] md:max-w-[min(100%,32rem)] lg:max-w-[min(100%,33rem)]">
                  <CeoMessageRichText
                    paragraphs={t.about.missionParagraphs}
                    className="space-y-5"
                    paragraphClassName="whitespace-normal break-keep break-words text-left text-[18px] font-normal leading-[1.75] text-[#333333] antialiased"
                    strongClassName="font-bold text-[#333333]"
                  />
                </div>
              </div>
              <div className="hidden min-h-0 min-w-0 select-none md:block" aria-hidden />
            </div>
          </section>
          <div className="-mt-[26px] mb-[160px] md:hidden px-1">
            <CeoMessageRichText
              paragraphs={t.about.missionParagraphs}
              className="space-y-5"
              paragraphClassName="whitespace-normal break-keep break-words text-left text-[14px] font-normal leading-[1.75] text-zinc-100 antialiased"
              strongClassName="font-bold text-white"
            />
          </div>

          <div className="text-center">
            <h2 className="mx-auto max-w-[52rem] bg-gradient-to-r from-[#dbe6ef] via-[#b9a8d6] to-[#9f8bc7] bg-clip-text text-balance break-keep text-2xl font-light leading-[1.35] tracking-wide text-transparent sm:text-[26px] md:text-[28px] lg:text-[30px]">
              {p.title}
            </h2>
            <div
              className="mx-auto mt-5 h-px w-16 max-w-full bg-gradient-to-r from-violet-400/50 via-fuchsia-400/60 to-rose-300/50 sm:mt-6 sm:w-20"
              aria-hidden
            />
          </div>

          <section
            className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-800/45 p-6 sm:p-8"
            aria-labelledby="tpf-overview-h"
          >
            <div className="grid items-start gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
              <div className="flex w-full min-w-0 justify-center md:justify-start">
                {/*
                  1200/2 ≈ 560~600px 콘솔: pin.gif(2x 에셋)은 논리 너비 이하로 표시 → max-w-[35rem] = 560px
                 */}
                <div className="relative w-full max-w-[min(100%,35rem)]">
                  <PinGifPlayer
                    src="/pin.gif"
                    alt={p.pinGifAlt}
                    className="mx-auto h-auto w-full max-h-[min(50vh,18rem)] max-w-full object-contain sm:max-h-[min(48vh,20rem)]"
                  />
                  <div
                    className="pointer-events-none absolute bottom-2 right-0 top-2 hidden w-px bg-zinc-400/45 md:block"
                    aria-hidden
                  />
                </div>
              </div>
              <div className="min-w-0 self-center">
                <h3 id="tpf-overview-h" className={tpfH3}>
                  {p.overviewTitle}
                </h3>
                <ul className={`${tpfBody} mt-5 sm:mt-6`} aria-labelledby="tpf-overview-h">
                  {p.overviewBullets.map((line, i) => (
                    <li key={`ov-${i}`} className="whitespace-pre-line">
                      {line}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section
            className="space-y-4 sm:space-y-5"
            aria-labelledby="tpf-adv-h"
          >
            <h3 id="tpf-adv-h" className={tpfH3}>
              {p.advantagesTitle}
            </h3>
            <TpfAdvantagesList p={p} />
          </section>

          <section
            className="p-0"
            aria-labelledby="tpf-resin-h"
          >
            <h3 id="tpf-resin-h" className={tpfH3}>
              {p.resinTitle}
            </h3>
            <ul
              className={`${tpfBody} mt-5 sm:mt-6`}
              aria-labelledby="tpf-resin-h"
            >
              {p.resinBullets.map((line, i) => (
                <li key={`resin-${i}`}>{line}</li>
              ))}
            </ul>
            <div className="relative mx-auto mt-6 aspect-[1200/420] w-full overflow-hidden rounded-xl border border-white/10 sm:mt-8">
              <div className="pointer-events-none absolute inset-0 opacity-10" aria-hidden>
                <Image
                  src="/box_bg.webp"
                  alt=""
                  fill
                  className="object-cover"
                  sizes={SIZES_FULL_1200}
                  quality={80}
                />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(100,100,120,0.12)_0%,transparent_55%)]" aria-hidden />
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/tech01.webp"
                  alt={p.tech01Alt}
                  width={1200}
                  height={420}
                  className="h-auto w-3/5 object-contain"
                  sizes="(max-width: 640px) 82vw, 50vw"
                  quality={85}
                />
              </div>
            </div>
          </section>

          <section
            className="pb-4"
            aria-labelledby="tpf-pin-h"
          >
            <h3 id="tpf-pin-h" className={tpfH3}>
              {p.pinTitle}
            </h3>
            <ul
              className={`${tpfBody} mt-5 sm:mt-6`}
              aria-labelledby="tpf-pin-h"
            >
              {p.pinProcessBullets.map((line, i) => (
                <li key={`pin-${i}`} className="whitespace-pre-line">
                  {line}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
