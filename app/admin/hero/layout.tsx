import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "히어로 미디어 관리 | U:RION",
  robots: { index: false, follow: false },
};

export default function AdminHeroLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
