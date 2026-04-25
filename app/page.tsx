/** 홈은 `Landing`만 렌더합니다. (Spline 제거됨 — 복구 시 Git 히스토리·`@splinetool/*` 패키지 참고) */
import { Landing } from "./components/Landing";

export default function Home() {
  return <Landing />;
}
