import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n/locale";

const LOCALE_HEADER = "x-locale-effective";

/**
 * 모든 요청에 x-locale-effective 를 붙여 RSC 첫 렌더에서도 언어를 맞춥니다.
 * locale 쿠키가 없을 때만 쿠키를 설정: Vercel x-vercel-ip-country 가 KR 이 아니면 en.
 */
export function middleware(request: NextRequest) {
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  let locale: "ko" | "en";

  if (existing === "ko" || existing === "en") {
    locale = existing;
  } else {
    const country = request.headers.get("x-vercel-ip-country");
    locale =
      country != null && country !== "" && country !== "KR" ? "en" : "ko";
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  const res = NextResponse.next({ request: { headers: requestHeaders } });

  if (!(existing === "ko" || existing === "en")) {
    res.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
