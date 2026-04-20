"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { heroApiUrl } from "@/lib/hero-endpoint";
import type { HeroSlide } from "@/lib/hero-types";
import {
  HERO_ALLOWED_EXTENSIONS,
  extFromUrlOrPath,
  inferHeroKind,
  isAllowedHeroExtension,
} from "@/lib/hero-types";

const SECRET_KEY = "urion_hero_admin_secret";

function normalizeRemoteSlides(raw: unknown): HeroSlide[] {
  if (!Array.isArray(raw)) return [];
  const out: HeroSlide[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const url = typeof o.url === "string" ? o.url.trim() : "";
    if (!url) continue;
    const ext = extFromUrlOrPath(url);
    if (!isAllowedHeroExtension(ext)) continue;
    const id =
      typeof o.id === "string" && o.id.trim()
        ? o.id.trim()
        : crypto.randomUUID();
    const kind =
      o.kind === "video" || o.kind === "image"
        ? o.kind
        : inferHeroKind(url);
    out.push({ id, url, kind });
  }
  return out;
}

export default function AdminHeroPage() {
  const [secret, setSecret] = useState("");
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const persistSecret = useCallback((v: string) => {
    setSecret(v);
    if (typeof window === "undefined") return;
    if (v.trim()) sessionStorage.setItem(SECRET_KEY, v.trim());
    else sessionStorage.removeItem(SECRET_KEY);
  }, []);

  const loadSlides = useCallback(async () => {
    setLoadError(null);
    try {
      const r = await fetch(heroApiUrl("/api/hero"), { cache: "no-store" });
      if (r.ok) {
        const j = (await r.json()) as { slides?: unknown };
        setSlides(normalizeRemoteSlides(j.slides));
        return;
      }
      const r2 = await fetch("/data/hero-slides.json", { cache: "no-store" });
      if (r2.ok) {
        const j = (await r2.json()) as { slides?: unknown };
        setSlides(normalizeRemoteSlides(j.slides));
        return;
      }
      setLoadError("슬라이드 데이터를 불러오지 못했습니다.");
    } catch {
      setLoadError("네트워크 오류로 불러오지 못했습니다.");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const s = sessionStorage.getItem(SECRET_KEY);
    if (s) setSecret(s);
    void loadSlides();
  }, [loadSlides]);

  const saveSlides = async () => {
    if (!secret.trim()) {
      setStatus("관리자 비밀키를 입력하세요.");
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(heroApiUrl("/api/hero"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${secret.trim()}`,
        },
        body: JSON.stringify({ version: 1, slides }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: { code?: string; message?: string };
      };
      if (!res.ok) {
        setStatus(
          data.error?.message ??
            (data.error?.code === "KV_NOT_CONFIGURED"
              ? "KV(HERO_KV)가 연결되지 않았습니다. Cloudflare에서 바인딩 후 저장하거나, 아래 JSON 내려받기로 public/data/hero-slides.json을 갱신하세요."
              : `저장 실패 (${res.status})`),
        );
        return;
      }
      setStatus(`저장되었습니다. (${slides.length}개)`);
      await loadSlides();
    } catch {
      setStatus("저장 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const uploadFile = async (file: File) => {
    if (!secret.trim()) {
      setStatus("업로드하려면 관리자 비밀키가 필요합니다.");
      return;
    }
    const ext = extFromUrlOrPath(file.name || "");
    if (!isAllowedHeroExtension(ext)) {
      setStatus(
        `허용되지 않는 형식입니다. (${HERO_ALLOWED_EXTENSIONS.join(", ")})`,
      );
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch(heroApiUrl("/api/hero/upload"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secret.trim()}`,
        },
        body: fd,
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        url?: string;
        error?: { code?: string; message?: string };
      };
      if (!res.ok) {
        setStatus(
          data.error?.message ??
            (data.error?.code === "R2_NOT_CONFIGURED"
              ? "R2(HERO_BUCKET) 또는 HERO_PUBLIC_MEDIA_BASE가 없습니다. URL로 직접 추가하거나 Cloudflare에 바인딩하세요."
              : `업로드 실패 (${res.status})`),
        );
        return;
      }
      if (!data.url) {
        setStatus("업로드 응답에 URL이 없습니다.");
        return;
      }
      const id = crypto.randomUUID();
      setSlides((prev) => [
        ...prev,
        { id, url: data.url!, kind: inferHeroKind(data.url!) },
      ]);
      setStatus("파일이 업로드되어 목록에 추가되었습니다. 저장을 눌러 반영하세요.");
    } catch {
      setStatus("업로드 중 오류가 발생했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const addByUrl = () => {
    const u = urlInput.trim();
    if (!u) {
      setStatus("URL을 입력하세요.");
      return;
    }
    const ext = extFromUrlOrPath(u);
    if (!isAllowedHeroExtension(ext)) {
      setStatus(
        `URL 경로의 확장자가 허용 목록에 없습니다. (${HERO_ALLOWED_EXTENSIONS.join(", ")})`,
      );
      return;
    }
    const id = crypto.randomUUID();
    setSlides((prev) => [
      ...prev,
      { id, url: u, kind: inferHeroKind(u) },
    ]);
    setUrlInput("");
    setStatus("목록에 추가되었습니다. 저장을 눌러 반영하세요.");
  };

  const move = (index: number, dir: -1 | 1) => {
    setSlides((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      const t = next[index]!;
      next[index] = next[j]!;
      next[j] = t;
      return next;
    });
  };

  const removeAt = (index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify({ version: 1, slides }, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hero-slides.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus("hero-slides.json 파일을 내려받았습니다. 저장소의 public/data/hero-slides.json에 덮어쓰면 다음 배포에 반영됩니다.");
  };

  const acceptAttr = HERO_ALLOWED_EXTENSIONS.map((e) => `.${e}`).join(",");

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
              Admin
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              히어로 미디어
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              mp4, gif, webp, png, jpeg, jpg · 라이브 사이트는{" "}
              <code className="rounded bg-zinc-900 px-1 py-0.5 text-zinc-300">
                /api/hero
              </code>{" "}
              또는{" "}
              <code className="rounded bg-zinc-900 px-1 py-0.5 text-zinc-300">
                /data/hero-slides.json
              </code>
              를 사용합니다.
            </p>
          </div>
          <Link
            href="/"
            className="text-sm text-violet-400 hover:text-violet-300"
          >
            ← 사이트로
          </Link>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-6 shadow-xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <p className="text-lg font-semibold tabular-nums text-white">
              등록된 미디어:{" "}
              <span className="text-violet-300">{slides.length}</span>개
            </p>
            <button
              type="button"
              onClick={() => void loadSlides()}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/5"
            >
              새로고침
            </button>
          </div>

          {loadError ? (
            <p className="mt-4 text-sm text-amber-400">{loadError}</p>
          ) : null}

          <label className="mt-6 block text-sm font-medium text-zinc-300">
            관리자 비밀키 (HERO_ADMIN_SECRET)
            <input
              type="password"
              value={secret}
              onChange={(e) => persistSecret(e.target.value)}
              autoComplete="off"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-violet-500/40 focus:ring-2"
              placeholder="Bearer 토큰과 동일한 값"
            />
          </label>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-zinc-300">파일 업로드</p>
              <p className="mt-1 text-xs text-zinc-500">
                R2 바인딩이 있을 때만 동작합니다.
              </p>
              <input
                type="file"
                accept={acceptAttr}
                disabled={busy}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) void uploadFile(f);
                }}
                className="mt-2 block w-full text-sm text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-violet-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-violet-500"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-300">URL 직접 추가</p>
              <p className="mt-1 text-xs text-zinc-500">
                CDN 등 공개 URL (허용 확장자로 끝나야 함)
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://…/banner.webp"
                  className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none ring-violet-500/40 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={addByUrl}
                  disabled={busy}
                  className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white hover:bg-violet-500 disabled:opacity-50"
                >
                  추가
                </button>
              </div>
            </div>
          </div>

          <ul className="mt-8 space-y-3">
            {slides.length === 0 ? (
              <li className="rounded-lg border border-dashed border-white/15 py-10 text-center text-sm text-zinc-500">
                등록된 항목이 없습니다.
              </li>
            ) : (
              slides.map((s, i) => (
                <li
                  key={s.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center"
                >
                  <div className="h-24 w-full shrink-0 overflow-hidden rounded-lg bg-zinc-800 sm:h-20 sm:w-36">
                    {s.kind === "video" ? (
                      <video
                        src={s.url}
                        className="h-full w-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={s.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase text-zinc-500">
                      {s.kind === "video" ? "video" : "image"} ·{" "}
                      {extFromUrlOrPath(s.url)}
                    </p>
                    <p className="mt-1 truncate font-mono text-xs text-zinc-400">
                      {s.url}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={busy || i === 0}
                      onClick={() => move(i, -1)}
                      className="rounded border border-white/10 px-2 py-1 text-xs hover:bg-white/5 disabled:opacity-30"
                    >
                      위로
                    </button>
                    <button
                      type="button"
                      disabled={busy || i === slides.length - 1}
                      onClick={() => move(i, 1)}
                      className="rounded border border-white/10 px-2 py-1 text-xs hover:bg-white/5 disabled:opacity-30"
                    >
                      아래로
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => removeAt(i)}
                      className="rounded border border-red-500/30 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      삭제
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void saveSlides()}
              className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 disabled:opacity-50"
            >
              {busy ? "처리 중…" : "서버에 저장 (KV)"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={downloadJson}
              className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-medium text-zinc-200 hover:bg-white/5"
            >
              JSON 내려받기
            </button>
          </div>

          {status ? (
            <p className="mt-4 text-sm text-zinc-300">{status}</p>
          ) : null}

          <div className="mt-8 rounded-lg border border-white/10 bg-black/30 p-4 text-xs leading-relaxed text-zinc-500">
            <p className="font-medium text-zinc-400">Cloudflare Pages</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                <strong className="text-zinc-400">HERO_ADMIN_SECRET</strong>{" "}
                환경 변수에 비밀 문자열을 넣고, 위 입력란에 동일 값을 입력합니다.
              </li>
              <li>
                라이브 저장: KV 네임스페이스를 생성 후 바인딩 이름{" "}
                <code className="text-zinc-400">HERO_KV</code>로 연결합니다.
              </li>
              <li>
                파일 업로드: R2 버킷 바인딩{" "}
                <code className="text-zinc-400">HERO_BUCKET</code>, 공개 베이스
                URL{" "}
                <code className="text-zinc-400">HERO_PUBLIC_MEDIA_BASE</code>{" "}
                (예: 커스텀 도메인, 슬래시 없이)을 설정합니다.
              </li>
              <li>
                KV 없이 정적만 쓸 경우:{" "}
                <code className="text-zinc-400">JSON 내려받기</code>로{" "}
                <code className="text-zinc-400">public/data/hero-slides.json</code>
                을 교체한 뒤 배포합니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
