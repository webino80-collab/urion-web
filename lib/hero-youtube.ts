/**
 * 히어로 YouTube 임베드용: watch / youtu.be / Shorts / embed URL에서 11자 영상 ID만 추출.
 * functions/api/hero.ts 등 엣지·클라이언트에서 공용으로 사용(React 의존 없음).
 */
const YOUTUBE_ID = /^[a-zA-Z0-9_-]{11}$/;

function isYouTubeHostname(hostname: string): boolean {
  const h = hostname.replace(/^www\./, "");
  if (h === "youtu.be") return true;
  if (h === "youtube.com" || h.endsWith(".youtube.com")) return true;
  return false;
}

/**
 * youtu.be/ID, watch?v=, /shorts/ID, /embed/ID 등 → 11자 ID 또는 null
 */
export function parseYouTubeVideoId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (YOUTUBE_ID.test(s)) return s;
  let u: URL;
  try {
    u = new URL(s, "https://www.youtube.com");
  } catch {
    return null;
  }
  if (!isYouTubeHostname(u.hostname)) return null;
  if (u.hostname === "youtu.be" || u.hostname === "www.youtu.be") {
    const seg = u.pathname.split("/").filter(Boolean)[0] ?? "";
    return YOUTUBE_ID.test(seg) ? seg : null;
  }
  const v = u.searchParams.get("v");
  if (v && YOUTUBE_ID.test(v)) return v;
  for (const prefix of ["/shorts/", "/embed/", "/v/", "/live/"] as const) {
    if (u.pathname.startsWith(prefix)) {
      const seg = u.pathname.slice(prefix.length).split("/")[0] ?? "";
      if (YOUTUBE_ID.test(seg)) return seg;
    }
  }
  return null;
}

export type YouTubeHeroEmbedOptions = {
  /**
   * true: privacy-enhanced (youtube-nocookie.com)
   * false(기본): www.youtube.com — 임베드 오류 153(Referer/구성)이 날 때 우선 사용
   */
  useNoCookie?: boolean;
  /**
   * 현재 페이지 origin. 153 완화용.
   * `localhost` / `127.0.0.1` / http는 붙이지 말 것 — "동영상을 재생할 수 없음"이 날 수 있음.
   */
  origin?: string;
};

/**
 * 히어로 임베드에 붙일 `origin` 쿼리 값.
 * 로컬·file·비보안 연결은 `undefined` (YouTube가 요청을 거절하는 경우가 있음).
 */
export function embedPageOriginForLocation(loc: {
  origin: string;
  protocol: string;
  hostname: string;
}): string | undefined {
  const { protocol, hostname } = loc;
  if (protocol !== "https:") return undefined;
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h === "[::1]") return undefined;
  if (h.endsWith(".localhost")) return undefined;
  return loc.origin;
}

/**
 * 루프: `playlist=동일 ID` (IFrame 규칙).
 * @see YouTube 153: Referer가 없거나 `Referrer-Policy`가 과도하면 "동영상 플레이어 구성 오류" 발생
 */
export function buildYouTubeHeroEmbedSrc(
  videoId: string,
  options: YouTubeHeroEmbedOptions = {},
): string {
  const { useNoCookie = false, origin } = options;
  /** fs·disablekb는 환경에 따라 플레이어가 '재생 불가'로 떨어질 수 있어 최소한만 사용 */
  const q = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    loop: "1",
    playlist: videoId,
    controls: "0",
    modestbranding: "1",
    rel: "0",
    playsinline: "1",
  });
  if (origin) q.set("origin", origin);
  const base = useNoCookie
    ? "https://www.youtube-nocookie.com/embed"
    : "https://www.youtube.com/embed";
  return `${base}/${encodeURIComponent(videoId)}?${q.toString()}`;
}
