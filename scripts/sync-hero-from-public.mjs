#!/usr/bin/env node
/**
 * public/hero 안의 미디어 파일을 읽어 public/data/hero-slides.json 을 덮어씁니다.
 * 사용: 미디어를 public/hero/ 에 넣은 뒤 `npm run hero:sync` → `npm run build`
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const HERO_MEDIA = path.join(ROOT, "public", "hero");
const OUT = path.join(ROOT, "public", "data", "hero-slides.json");

const ALLOWED = /\.(mp4|gif|webp|png|jpeg|jpg)$/i;

function main() {
  if (!fs.existsSync(HERO_MEDIA)) {
    fs.mkdirSync(HERO_MEDIA, { recursive: true });
  }

  const slides = [];
  for (const ent of fs.readdirSync(HERO_MEDIA, { withFileTypes: true })) {
    if (!ent.isFile()) continue;
    if (!ALLOWED.test(ent.name)) continue;
    const url = `/hero/${ent.name}`;
    const ext = ent.name.split(".").pop()?.toLowerCase() ?? "";
    const kind = ext === "mp4" ? "video" : "image";
    const id = ent.name.replace(/[^a-zA-Z0-9-_.]/g, "_");
    slides.push({ id, url, kind });
  }
  slides.sort((a, b) => a.url.localeCompare(b.url));

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(
    OUT,
    `${JSON.stringify({ version: 1, slides }, null, 2)}\n`,
    "utf8",
  );
  console.log(
    `hero:sync — ${slides.length}개 → ${path.relative(ROOT, OUT)} (소스: public/hero/)`,
  );
}

main();
