/**
 * POST /api/hero/upload — multipart file → R2 (HERO_BUCKET, HERO_PUBLIC_MEDIA_BASE, HERO_ADMIN_SECRET)
 */

interface R2Bucket {
  put(
    key: string,
    value: ReadableStream<Uint8Array> | ArrayBuffer | Blob,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
}

interface UploadEnv {
  HERO_BUCKET?: R2Bucket;
  HERO_ADMIN_SECRET?: string;
  /** 공개 접근 가능한 R2 커스텀 도메인 등, 슬래시 없이. 예: https://media.example.com */
  HERO_PUBLIC_MEDIA_BASE?: string;
}

const ALLOWED = new Set([
  "mp4",
  "gif",
  "webp",
  "png",
  "jpeg",
  "jpg",
]);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function extFromFilename(name: string): string | null {
  const m = /\.([a-z0-9]+)$/i.exec(name.trim());
  return m ? m[1].toLowerCase() : null;
}

function mimeForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case "mp4":
      return "video/mp4";
    case "webp":
      return "image/webp";
    case "png":
      return "image/png";
    case "gif":
      return "image/gif";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}

export async function onRequestPost(context: {
  request: Request;
  env: UploadEnv;
}): Promise<Response> {
  const { request, env } = context;
  const secret = env.HERO_ADMIN_SECRET?.trim();
  const auth = request.headers.get("Authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return json({ error: { code: "UNAUTHORIZED" } }, 401);
  }

  const bucket = env.HERO_BUCKET;
  const base = env.HERO_PUBLIC_MEDIA_BASE?.trim().replace(/\/$/, "");
  if (!bucket || !base) {
    return json(
      {
        error: {
          code: "R2_NOT_CONFIGURED",
          message:
            "HERO_BUCKET 및 HERO_PUBLIC_MEDIA_BASE를 Pages에 바인딩·설정해야 업로드할 수 있습니다.",
        },
      },
      501,
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: { code: "BAD_FORM" } }, 400);
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return json({ error: { code: "NO_FILE" } }, 400);
  }

  const ext = extFromFilename(file.name || "");
  if (!ext || !ALLOWED.has(ext)) {
    return json(
      {
        error: {
          code: "BAD_EXTENSION",
          message: "허용: mp4, gif, webp, png, jpeg, jpg",
        },
      },
      400,
    );
  }

  const maxBytes = 80 * 1024 * 1024;
  if (file.size > maxBytes) {
    return json({ error: { code: "FILE_TOO_LARGE" } }, 413);
  }

  const key = `hero/${crypto.randomUUID()}.${ext}`;
  const contentType = file.type?.trim() || mimeForExt(ext);

  await bucket.put(key, file.stream(), {
    httpMetadata: { contentType },
  });

  const url = `${base}/${key}`;
  return json({ ok: true, url, key });
}
