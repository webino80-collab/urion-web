export type HeroSlideKind = "image" | "video";

export type HeroSlide = {
  id: string;
  url: string;
  kind: HeroSlideKind;
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

export function isAllowedHeroExtension(ext: string): ext is HeroAllowedExt {
  const e = ext.toLowerCase().replace(/^\./, "");
  return (HERO_ALLOWED_EXTENSIONS as readonly string[]).includes(e);
}
