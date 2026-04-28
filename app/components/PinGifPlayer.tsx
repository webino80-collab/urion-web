"use client";

import { useEffect, useRef } from "react";
import { decompressFrames, parseGIF, type ParsedFrame } from "gifuct-js";

const PAUSE_MS = 1000;
const BLACK_KEY_THRESHOLD = 26;

/**
 * 원본 GIF가 검은 배경으로 인코딩된 경우, 랜딩 다크 배경 위에서 배경만 투명화.
 * (완전 검정 + 근접 어두운 픽셀을 알파 0으로 처리)
 */
function removeBlackBackground(imageData: ImageData): ImageData {
  const out = new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height,
  );
  const data = out.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a === 0) continue;
    if (r <= BLACK_KEY_THRESHOLD && g <= BLACK_KEY_THRESHOLD && b <= BLACK_KEY_THRESHOLD) {
      data[i + 3] = 0;
    }
  }
  return out;
}

function drawPatch(
  gifCtx: CanvasRenderingContext2D,
  tempCanvas: HTMLCanvasElement,
  tempCtx: CanvasRenderingContext2D,
  frame: ParsedFrame,
) {
  const dims = frame.dims;
  tempCanvas.width = dims.width;
  tempCanvas.height = dims.height;
  const frameImageData = tempCtx.createImageData(dims.width, dims.height);
  frameImageData.data.set(frame.patch);
  tempCtx.putImageData(frameImageData, 0, 0);
  gifCtx.drawImage(tempCanvas, dims.left, dims.top);
}

function applyDisposal(
  gifCtx: CanvasRenderingContext2D,
  prev: ParsedFrame | undefined,
) {
  if (!prev) return;
  if (prev.disposalType === 2) {
    const { left, top, width, height } = prev.dims;
    gifCtx.clearRect(left, top, width, height);
  }
}

/** 각 인덱스까지 합성한 전체 캔버스 스냅샷 (정·역 재생에 동일 지연 사용) */
function buildSnapshots(
  frames: ParsedFrame[],
  width: number,
  height: number,
): ImageData[] {
  const gifCanvas = document.createElement("canvas");
  gifCanvas.width = width;
  gifCanvas.height = height;
  const gifCtx = gifCanvas.getContext("2d", { willReadFrequently: true });
  if (!gifCtx) return [];

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");
  if (!tempCtx) return [];

  const snaps: ImageData[] = [];
  for (let idx = 0; idx < frames.length; idx++) {
    gifCtx.clearRect(0, 0, width, height);
    for (let i = 0; i <= idx; i++) {
      if (i > 0) applyDisposal(gifCtx, frames[i - 1]);
      drawPatch(gifCtx, tempCanvas, tempCtx, frames[i]);
    }
    snaps.push(removeBlackBackground(gifCtx.getImageData(0, 0, width, height)));
  }
  return snaps;
}

type PinGifPlayerProps = {
  src: string;
  alt: string;
  className?: string;
};

export function PinGifPlayer({ src, alt, className }: PinGifPlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    const clearAll = () => {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    };

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timeoutsRef.current.push(id);
    };

    (async () => {
      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(String(res.status));
        const buf = await res.arrayBuffer();
        const parsed = parseGIF(buf);
        const frames = decompressFrames(parsed, true);
        if (cancelled || frames.length === 0) return;

        const w = parsed.lsd.width;
        const h = parsed.lsd.height;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const snaps = buildSnapshots(frames, w, h);
        if (snaps.length === 0) return;

        if (reduceMotion) {
          ctx.putImageData(snaps[0], 0, 0);
          return;
        }

        let i = 0;

        const forwardStep = () => {
          if (cancelled) return;
          ctx.putImageData(snaps[i], 0, 0);
          const d = Math.max(20, frames[i].delay);
          if (i >= frames.length - 1) {
            schedule(() => reverseStep(), PAUSE_MS);
            return;
          }
          const next = i + 1;
          schedule(() => {
            i = next;
            forwardStep();
          }, d);
        };

        const reverseStep = () => {
          if (cancelled) return;
          ctx.putImageData(snaps[i], 0, 0);
          if (i <= 0) {
            schedule(() => {
              i = 0;
              forwardStep();
            }, PAUSE_MS);
            return;
          }
          const d = Math.max(20, frames[i].delay);
          const next = i - 1;
          schedule(() => {
            i = next;
            reverseStep();
          }, d);
        };

        const runLoop = () => {
          if (cancelled) return;
          i = 0;
          forwardStep();
        };

        runLoop();
      } catch {
        if (!cancelled && canvasRef.current) {
          const c = canvasRef.current;
          const x = c.getContext("2d");
          if (x) {
            x.clearRect(0, 0, c.width, c.height);
          }
        }
      }
    })();

    return () => {
      cancelled = true;
      clearAll();
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt}
      className={className}
    />
  );
}
