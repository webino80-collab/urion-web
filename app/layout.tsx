import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import { I18nProvider } from "@/app/components/I18nProvider";
import {
  LOCALE_COOKIE,
  LOCALE_EFFECTIVE_HEADER,
  parseLocaleCookie,
  type Locale,
} from "@/lib/i18n/locale";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function resolveLocale(): Promise<Locale> {
  const headerStore = await headers();
  const cookieStore = await cookies();
  return parseLocaleCookie(
    headerStore.get(LOCALE_EFFECTIVE_HEADER) ??
      cookieStore.get(LOCALE_COOKIE)?.value,
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale();
  const en = locale === "en";
  return {
    title: en
      ? "U:RION — From vision to reality"
      : "U:RION — 상상을, 현실로",
    description: en
      ? "Strategy through execution—we design digital experiences that move your business forward."
      : "Full-page 랜딩 — 전략부터 실행까지 디지털 경험을 설계합니다.",
  };
}

export default async function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  const initialLocale = await resolveLocale();

  return (
    <html
      lang={initialLocale}
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-hidden antialiased`}
    >
      <body className="flex h-full min-h-0 flex-col overflow-hidden bg-black">
        <I18nProvider initialLocale={initialLocale}>
          {children}
          {modal}
        </I18nProvider>
      </body>
    </html>
  );
}
