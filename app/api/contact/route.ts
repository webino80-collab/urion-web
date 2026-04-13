import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  getContactPayloadSchema,
  type ContactPayload,
} from "@/lib/contact";
import type { Locale } from "@/lib/i18n/locale";
import {
  hasResendApiKeyButIncompleteFromTo,
  isResendFullyConfigured,
  sendContactEmailViaResend,
} from "@/lib/send-contact-email";

export const runtime = "nodejs";

function requestLocale(request: Request): Locale {
  const raw = request.headers.get("x-locale");
  if (raw === "en" || raw === "ko") return raw;
  return "ko";
}

const apiText = {
  ko: {
    invalidJson: "요청 본문이 올바르지 않습니다.",
    validationSummary: "입력값을 확인해 주세요.",
    resendMisconfigured:
      "RESEND_API_KEY는 설정되어 있으나 CONTACT_FROM_EMAIL 또는 CONTACT_TO_EMAIL이 없습니다. Resend 대시보드에서 확인한 발신 주소와 수신 주소를 .env에 넣어 주세요.",
    emailSendFailed:
      "메일 전송에 실패했습니다. 발신 도메인·API 키 권한을 확인하거나 잠시 후 다시 시도해 주세요.",
    notConfigured:
      "문의 메일을 받으려면 Resend를 설정하세요: RESEND_API_KEY, CONTACT_FROM_EMAIL(검증된 발신), CONTACT_TO_EMAIL(수신). 또는 CONTACT_WEBHOOK_URL을 사용할 수 있습니다.",
  },
  en: {
    invalidJson: "Invalid request body.",
    validationSummary: "Please check the highlighted fields.",
    resendMisconfigured:
      "RESEND_API_KEY is set but CONTACT_FROM_EMAIL or CONTACT_TO_EMAIL is missing. Add verified from/to addresses from the Resend dashboard to your environment.",
    emailSendFailed:
      "Failed to send email. Check your domain, API key permissions, or try again later.",
    notConfigured:
      "To receive inquiries by email, configure Resend (RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL) or set CONTACT_WEBHOOK_URL.",
  },
} as const;

async function sendViaWebhook(payload: ContactPayload) {
  const url = process.env.CONTACT_WEBHOOK_URL;
  if (!url) return { ok: false as const };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "contact",
      ...payload,
      at: new Date().toISOString(),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[contact] Webhook error", res.status, text);
    return { ok: false as const, detail: text };
  }
  return { ok: true as const };
}

async function appendDevLog(payload: ContactPayload) {
  const dir = path.join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  const line =
    JSON.stringify({
      ...payload,
      at: new Date().toISOString(),
    }) + "\n";
  await appendFile(path.join(dir, "contacts.ndjson"), line, "utf8");
}

export async function POST(request: Request) {
  const loc = requestLocale(request);
  const T = apiText[loc];

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: T.invalidJson } },
      { status: 400 },
    );
  }

  const parsed = getContactPayloadSchema(loc).safeParse(json);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION",
          message: T.validationSummary,
          fieldErrors: flat.fieldErrors,
        },
      },
      { status: 400 },
    );
  }

  const payload = parsed.data;

  if (hasResendApiKeyButIncompleteFromTo()) {
    return NextResponse.json(
      {
        error: {
          code: "RESEND_MISCONFIGURED",
          message: T.resendMisconfigured,
        },
      },
      { status: 503 },
    );
  }

  if (isResendFullyConfigured()) {
    const sent = await sendContactEmailViaResend(payload);
    if (sent.ok) {
      return NextResponse.json({
        ok: true,
        channel: "email" as const,
        id: sent.id,
      });
    }
    return NextResponse.json(
      {
        error: {
          code: "EMAIL_SEND_FAILED",
          message: T.emailSendFailed,
        },
      },
      { status: 502 },
    );
  }

  const hook = await sendViaWebhook(payload);
  if (hook.ok) {
    return NextResponse.json({ ok: true, channel: "webhook" as const });
  }

  if (process.env.NODE_ENV === "development") {
    await appendDevLog(payload);
    return NextResponse.json({ ok: true, channel: "dev_file" as const });
  }

  return NextResponse.json(
    {
      error: {
        code: "NOT_CONFIGURED",
        message: T.notConfigured,
      },
    },
    { status: 503 },
  );
}
