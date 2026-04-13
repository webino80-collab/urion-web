import Spline from "@splinetool/react-spline/next";
import { isSplineSceneConfigured, SPLINE_SCENE_URL } from "@/lib/spline-scene";
import { Landing } from "./components/Landing";

export default function Home() {
  const scene = SPLINE_SCENE_URL.trim();
  const showSpline = isSplineSceneConfigured(scene);

  return (
    <>
      {showSpline ? (
        <div
          className="pointer-events-none fixed inset-0 z-0 h-[100dvh] w-full"
          style={{ pointerEvents: "none" }}
          aria-hidden
        >
          <Spline
            scene={scene}
            renderOnDemand={false}
            className="!h-full !w-full"
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          />
          {/* Spline 캔버스 위만 틴트 — 형제 레이어(z-1)였을 때 일부 환경에서 UI와 합성 순서가 꼬일 수 있음 */}
          <div className="pointer-events-none absolute inset-0 z-[1] bg-black/30" />
        </div>
      ) : null}
      <Landing />
      {showSpline ? (
        <>
          {/* Spline 워터마크(HTML). Landing(z-20) 밖·모달(z-50) 바로 아래 z-48 */}
          <div
            className="pointer-events-none fixed bottom-0 left-0 z-[48] h-20 w-96 bg-black sm:h-24 sm:w-[28rem]"
            aria-hidden
          />
          <div
            className="pointer-events-none fixed bottom-0 right-0 z-[48] h-20 w-96 bg-black sm:h-24 sm:w-[28rem]"
            aria-hidden
          />
        </>
      ) : null}
    </>
  );
}
