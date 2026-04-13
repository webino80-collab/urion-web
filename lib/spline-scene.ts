/**
 * Spline보내기 URL (`.splinecode` 링크).
 * 우선순위: 환경 변수 NEXT_PUBLIC_SPLINE_URL → 아래 기본값(직접 붙여넣기).
 */
export const SPLINE_SCENE_URL =
  process.env.NEXT_PUBLIC_SPLINE_URL ??
  "https://prod.spline.design/8bAnI9J1JqixSYhx/scene.splinecode";

export function isSplineSceneConfigured(url: string): boolean {
  return typeof url === "string" && /^https?:\/\//i.test(url.trim());
}
