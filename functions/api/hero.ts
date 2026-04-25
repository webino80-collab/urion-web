/**
 * GET  /api/hero  — 히어로 슬라이드 JSON (KV → 없으면 정적 /data/hero-slides.json)
 * POST /api/hero  — 슬라이드 저장 (HERO_KV + HERO_ADMIN_SECRET 필요)
 *
 * Cloudflare Pages: KV 바인딩 이름 HERO_KV, (선택) ASSETS로 정적 JSON 폴백.
 */

interface KVNamespace {
  get(key: string, type?: "text"): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

type SlideKind = "image" | "video";

type Slide = {
  id: string;
  url: string;
  kind: SlideKind;
  mobileUrl?: string;
};

interface HeroEnv {
  HERO_KV?: KVNamespace;
  HERO_ADMIN_SECRET?: string;
  ASSETS?: { fetch(input: Request | string): Promise<Response> };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

const ALLOWED_EXT = new Set([
  "mp4",
  "gif",
  "webp",
  "png",
  "jpeg",
  "jpg",
]);

function extFromUrl(url: string): string {
  try {
    const u = new URL(url, "https://placeholder.local");
    const m = /\.([a-z0-9]+)$/i.exec(u.pathname);
    return m ? m[1].toLowerCase() : "";
  } catch {
    const m = /\.([a-z0-9]+)$/i.exec((url.split("?")[0] ?? "").trim());
    return m ? m[1].toLowerCase() : "";
  }
}

function inferKind(url: string): SlideKind {
  return extFromUrl(url) === "mp4" ? "video" : "image";
}

function isValidSlideUrl(url: string): boolean {
  if (url.length > 2048) return false;
  if (url.startsWith("/")) return true;
  if (url.startsWith("https://") || url.startsWith("http://")) return true;
  return false;
}

function normalizeSlideInput(item: unknown): Slide | null {
  if (!item || typeof item !== "object") return null;
  const o = item as Record<string, unknown>;
  const url = typeof o.url === "string" ? o.url.trim() : "";
  if (!url || !isValidSlideUrl(url)) return null;
  const id =
    typeof o.id === "string" && o.id.trim() ? o.id.trim() : crypto.randomUUID();
  const kind =
    o.kind === "video" || o.kind === "image" ? o.kind : inferKind(url);
  const ext = extFromUrl(url);
  if (!ALLOWED_EXT.has(ext)) return null;
  let mobileUrl: string | undefined;
  const rawMobile =
    typeof o.mobileUrl === "string" ? o.mobileUrl.trim() : "";
  if (kind === "video" && rawMobile) {
    const extM = extFromUrl(rawMobile);
    if (isValidSlideUrl(rawMobile) && ALLOWED_EXT.has(extM)) {
      mobileUrl = rawMobile;
    }
  }
  return mobileUrl ? { id, url, kind, mobileUrl } : { id, url, kind };
}

function parseSlidesBody(body: unknown): Slide[] | null {
  if (!body || typeof body !== "object") return null;
  const slides = (body as { slides?: unknown }).slides;
  if (!Array.isArray(slides) || slides.length > 30) return null;
  const out: Slide[] = [];
  for (const item of slides) {
    const s = normalizeSlideInput(item);
    if (s) out.push(s);
  }
  return out;
}

export async function onRequestGet(context: {
  request: Request;
  env: HeroEnv;
}): Promise<Response> {
  const { env, request } = context;
  const origin = new URL(request.url).origin;

  if (env.HERO_KV) {
    const raw = await env.HERO_KV.get("hero_slides", "text");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { slides?: unknown };
        if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          const slides: Slide[] = [];
          for (const item of parsed.slides) {
            const s = normalizeSlideInput(item);
            if (s) slides.push(s);
          }
          if (slides.length > 0) {
            return json({ version: 1, slides, source: "kv" });
          }
        }
      } catch {
        /* fall through */
      }
    }
  }

  if (env.ASSETS) {
    const r = await env.ASSETS.fetch(`${origin}/data/hero-slides.json`);
    if (r.ok) {
      const text = await r.text();
      return new Response(text, {
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }
  }

  return json({ version: 1, slides: [], source: "empty" });
}

export async function onRequestPost(context: {
  request: Request;
  env: HeroEnv;
}): Promise<Response> {
  const { request, env } = context;
  const secret = env.HERO_ADMIN_SECRET?.trim();
  const auth = request.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return json({ error: { code: "UNAUTHORIZED" } }, 401);
  }
  if (!env.HERO_KV) {
    return json(
      {
        error: {
          code: "KV_NOT_CONFIGURED",
          message:
            "HERO_KV 바인딩이 없습니다. wrangler / Pages 대시보드에서 KV를 연결하세요.",
        },
      },
      501,
    );
  }

  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return json({ error: { code: "INVALID_JSON" } }, 400);
  }

  const slides = parseSlidesBody(parsed);
  if (!slides) {
    return json({ error: { code: "VALIDATION" } }, 400);
  }

  await env.HERO_KV.put("hero_slides", JSON.stringify({ version: 1, slides }));
  return json({ ok: true, count: slides.length });
}
