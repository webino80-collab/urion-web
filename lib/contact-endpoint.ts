/**
 * 정적 배포 시 브라우저에서 문의 POST를 보낼 절대 URL.
 * 예: 별도 Worker/Vercel에 두었던 기존 `/api/contact`와 동일한 JSON 계약의 엔드포인트.
 */
export function getPublicContactPostUrl(): string | undefined {
  const u = process.env.NEXT_PUBLIC_CONTACT_POST_URL?.trim();
  if (!u || !/^https?:\/\//i.test(u)) return undefined;
  return u;
}
