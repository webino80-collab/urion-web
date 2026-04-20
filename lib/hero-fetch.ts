import type { HeroConfig, HeroSlide } from "./hero-types";
import { inferHeroKind } from "./hero-types";

function normalizeSlides(raw: unknown): HeroSlide[] {
  if (!Array.isArray(raw)) return [];
  const out: HeroSlide[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const url = typeof o.url === "string" ? o.url.trim() : "";
    if (!url) continue;
    const id =
      typeof o.id === "string" && o.id.trim()
        ? o.id.trim()
        : crypto.randomUUID();
    const kind =
      o.kind === "video" || o.kind === "image"
        ? o.kind
        : inferHeroKind(url);
    out.push({ id, url, kind });
  }
  return out;
}

export async function fetchHeroSlides(signal?: AbortSignal): Promise<{
  slides: HeroSlide[];
  source: "api" | "static" | "none";
}> {
  try {
    const res = await fetch("/api/hero", {
      cache: "no-store",
      signal,
    });
    if (res.ok) {
      const j = (await res.json()) as Partial<HeroConfig> & {
        slides?: unknown;
      };
      const slides = normalizeSlides(j.slides);
      if (slides.length > 0) {
        return { slides, source: "api" };
      }
    }
  } catch {
    /* ignore */
  }

  try {
    const res = await fetch("/data/hero-slides.json", {
      cache: "no-store",
      signal,
    });
    if (res.ok) {
      const j = (await res.json()) as { slides?: unknown };
      const slides = normalizeSlides(j.slides);
      return { slides, source: slides.length ? "static" : "none" };
    }
  } catch {
    /* ignore */
  }

  return { slides: [], source: "none" };
}
