/**
 * 구 YouTube watch / youtu.be / Shorts / embed URL에서 11자 영상 ID 추출(히어로는 로컬 mp4로 통일하나,
 * 저장 JSON에 남은 링크를 `video`로 갈아끼울 때 사용).
 * React 의존 없음.
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
