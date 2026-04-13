import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { I18nProvider } from "@/app/components/I18nProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "U:RION — 상상을, 현실로",
  description:
    "전략부터 실행까지 디지털 경험을 설계합니다. / Strategy through execution—we design digital experiences that move your business forward.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  /** 정적 HTML 기본값. 실제 표시 언어는 I18nProvider가 쿠키·브라우저에서 복원 */
  const initialLocale = "ko" as const;

  return (
    <html
      lang={initialLocale}
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-hidden antialiased`}
    >
      <body className="flex h-full min-h-0 flex-col overflow-hidden bg-black">
        <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
