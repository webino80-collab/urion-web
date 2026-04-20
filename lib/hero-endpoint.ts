/**
 * 배포 도메인과 관리 UI 도메인이 다를 때만 절대 URL 지정.
 * 비우면 동일 출처 `/api/hero`, `/api/hero/upload` 사용.
 */
export function getHeroApiOrigin(): string {
  const u = process.env.NEXT_PUBLIC_HERO_API_ORIGIN?.trim();
  if (!u) return "";
  return u.replace(/\/$/, "");
}

export function heroApiUrl(path: "/api/hero" | "/api/hero/upload"): string {
  const base = getHeroApiOrigin();
  return base ? `${base}${path}` : path;
}
