import type { Metadata } from "next";
import { AboutOverlay } from "@/app/components/AboutOverlay";

export const metadata: Metadata = {
  title: "CEO — U:RION",
  description:
    "U:RION은 디지털 경험을 비즈니스 성장의 도구로 바라보며 전략부터 실행까지 함께합니다.",
};

export default function AboutPage() {
  return <AboutOverlay />;
}
