/**
 * 문의 폼 POST URL.
 * - `NEXT_PUBLIC_CONTACT_POST_URL`: 절대 URL(다른 도메인 API 등)이면 우선 사용.
 * - 그 외: 동일 출처 `/api/contact` (예: Cloudflare Pages `functions/api/contact.ts`).
 */
export function getContactPostUrl(): string {
  const u = process.env.NEXT_PUBLIC_CONTACT_POST_URL?.trim();
  if (u && /^https?:\/\//i.test(u)) return u;
  return "/api/contact";
}
