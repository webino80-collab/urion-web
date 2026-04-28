/** 랜딩 페이지 배경(본문/섹션) — `globals.css` @theme `landing-page`과 동기화 */
export const LANDING_PAGE_BG = "#222222";

/**
 * 데스크톱 1200 Figma(또는 기준)와 동기화.
 * 래스터(웹/웹) 에셋은 2x(@2x)로 둔 경우, CSS/레이아웃은 **논리 픽셀 = 이 MAX** 기준이면
 * 브라우저+Next Image `sizes`가 2DPR에서 적절한 w를 요청한다.
 */
export const MAX_CONTENT_WIDTH_PX = 1200;

/** TPF 섹션 내 다이어그램(수지) 최대 너비 — 1200 2단 레이아웃 기준(약 max-w-2xl) */
export const TPF_DIAGRAM_MAX_CSS_PX = 672;

/** CEO Message 카드 배경 에셋(Figma) — 2x면 2400×960. 래스터/레이아웃 비율 2.5:1 */
export const CEO_MESSAGE_BG_WIDTH_PX = 1200;
export const CEO_MESSAGE_BG_HEIGHT_PX = 480;
