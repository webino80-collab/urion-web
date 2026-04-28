import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import { I18nProvider } from "@/app/components/I18nProvider";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "U:RION — 상상을, 현실로",
  description:
    "전략부터 실행까지 디지털 경험을 설계합니다. / Strategy through execution—we design digital experiences that move your business forward.",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

/** 모바일 주소창·노치·테마색 일치 — Blink/WebKit 간 체감 차이 완화 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#222222",
  colorScheme: "dark",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  /** 정적 HTML 기본값. 실제 표시 언어는 I18nProvider가 쿠키·브라우저에서 복원 */
  const initialLocale = "ko" as const;

  return (
    <html
      lang={initialLocale}
      className={`min-h-dvh overflow-x-hidden font-sans antialiased ${notoSansKr.variable}`}
    >
      <head>
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </head>
      <body className="min-h-dvh overflow-x-hidden bg-landing-page text-zinc-100 antialiased">
        <I18nProvider initialLocale={initialLocale}>
          {children}
          {modal}
        </I18nProvider>
      </body>
    </html>
  );
}
