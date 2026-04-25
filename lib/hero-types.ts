export type HeroSlideKind = "image" | "video";

export type HeroSlide = {
  id: string;
  url: string;
  kind: HeroSlideKind;
  /** kind가 video일 때, 좁은 뷰포트에서 재생할 별도 영상 (예: 세로·저해상도) */
  mobileUrl?: string;
};

export type HeroConfig = {
  version: 1;
  slides: HeroSlide[];
};

const VIDEO_EXT = new Set(["mp4"]);

export const HERO_ALLOWED_EXTENSIONS = [
  "mp4",
  "gif",
  "webp",
  "png",
  "jpeg",
  "jpg",
] as const;

export type HeroAllowedExt = (typeof HERO_ALLOWED_EXTENSIONS)[number];

export function extFromUrlOrPath(url: string): string {
  try {
    const path = new URL(url, "https://dummy.local").pathname;
    const m = /\.([a-z0-9]+)$/i.exec(path);
    return m ? m[1].toLowerCase() : "";
  } catch {
    const m = /\.([a-z0-9]+)$/i.exec(url.split("?")[0] ?? "");
    return m ? m[1].toLowerCase() : "";
  }
}

export function inferHeroKind(url: string): HeroSlideKind {
  return VIDEO_EXT.has(extFromUrlOrPath(url)) ? "video" : "image";
}

/** JSON/API에서 온 mobileUrl 문자열을 검증해 슬라이드에 넣을 값으로 정규화 */
export function normalizeHeroMobileUrl(
  raw: unknown,
  slideKind: HeroSlideKind,
): string | undefined {
  if (slideKind !== "video") return undefined;
  const mobile = typeof raw === "string" ? raw.trim() : "";
  if (!mobile || inferHeroKind(mobile) !== "video") return undefined;
  return mobile;
}

export function isAllowedHeroExtension(ext: string): ext is HeroAllowedExt {
  const e = ext.toLowerCase().replace(/^\./, "");
  return (HERO_ALLOWED_EXTENSIONS as readonly string[]).includes(e);
}
