/**
 * Cloudflare Pages Function — POST /api/contact
 * Resend: RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL (Pages 환경 변수)
 * 또는 CONTACT_WEBHOOK_URL 단독 사용.
 */

type Locale = "ko" | "en";

interface Env {
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
  CONTACT_TO_EMAIL?: string;
  CONTACT_WEBHOOK_URL?: string;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function requestLocale(request: Request): Locale {
  const raw = request.headers.get("x-locale");
  return raw === "en" ? "en" : "ko";
}

const apiText = {
  ko: {
    invalidJson: "요청 본문이 올바르지 않습니다.",
    validationSummary: "입력값을 확인해 주세요.",
    resendMisconfigured:
      "RESEND_API_KEY는 설정되어 있으나 CONTACT_FROM_EMAIL 또는 CONTACT_TO_EMAIL이 없습니다.",
    emailSendFailed:
      "메일 전송에 실패했습니다. 발신 도메인·API 키 권한을 확인하거나 잠시 후 다시 시도해 주세요.",
    notConfigured:
      "문의 메일을 받으려면 Resend(RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL) 또는 CONTACT_WEBHOOK_URL을 Pages 환경 변수로 설정하세요.",
  },
  en: {
    invalidJson: "Invalid request body.",
    validationSummary: "Please check the highlighted fields.",
    resendMisconfigured:
      "RESEND_API_KEY is set but CONTACT_FROM_EMAIL or CONTACT_TO_EMAIL is missing.",
    emailSendFailed:
      "Failed to send email. Check your domain, API key permissions, or try again later.",
    notConfigured:
      "Configure Resend (RESEND_API_KEY, CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL) or CONTACT_WEBHOOK_URL in Pages environment variables.",
  },
} as const;

const fieldMsg = {
  ko: {
    nameRequired: "이름을 입력해 주세요.",
    nameTooLong: "이름이 너무 깁니다.",
    emailRequired: "이메일을 입력해 주세요.",
    emailInvalid: "올바른 이메일 형식이 아닙니다.",
    emailTooLong: "이메일이 너무 깁니다.",
    messageRequired: "메시지를 입력해 주세요.",
    messageTooLong: "메시지는 5,000자 이하로 작성해 주세요.",
  },
  en: {
    nameRequired: "Please enter your name.",
    nameTooLong: "Name is too long.",
    emailRequired: "Please enter your email.",
    emailInvalid: "Enter a valid email address.",
    emailTooLong: "Email is too long.",
    messageRequired: "Please enter a message.",
    messageTooLong: "Message must be 5,000 characters or less.",
  },
} as const;

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePayload(
  body: unknown,
  loc: Locale,
): { ok: true; data: { name: string; email: string; message: string } } | { ok: false; errors: Record<string, string[]> } {
  const m = fieldMsg[loc];
  const errors: Record<string, string[]> = {};
  if (!body || typeof body !== "object") {
    return { ok: false, errors: { root: [m.messageRequired] } };
  }
  const o = body as Record<string, unknown>;
  const name = typeof o.name === "string" ? o.name.trim() : "";
  const email = typeof o.email === "string" ? o.email.trim() : "";
  const message = typeof o.message === "string" ? o.message.trim() : "";

  if (!name) errors.name = [m.nameRequired];
  else if (name.length > 120) errors.name = [m.nameTooLong];
  if (!email) errors.email = [m.emailRequired];
  else if (email.length > 254) errors.email = [m.emailTooLong];
  else if (!emailRe.test(email)) errors.email = [m.emailInvalid];
  if (!message) errors.message = [m.messageRequired];
  else if (message.length > 5000) errors.message = [m.messageTooLong];

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, data: { name, email, message } };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

function hasResendKeyIncompleteFromTo(env: Env) {
  const key = env.RESEND_API_KEY?.trim();
  const from = env.CONTACT_FROM_EMAIL?.trim();
  const to = env.CONTACT_TO_EMAIL?.trim();
  return Boolean(key) && (!from || !to);
}

function isResendReady(env: Env) {
  return Boolean(
    env.RESEND_API_KEY?.trim() &&
      env.CONTACT_FROM_EMAIL?.trim() &&
      env.CONTACT_TO_EMAIL?.trim(),
  );
}

export async function onRequestPost(context: {
  request: Request;
  env: Env;
}): Promise<Response> {
  const { request, env } = context;
  const loc = requestLocale(request);
  const T = apiText[loc];

  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return json(
      { error: { code: "INVALID_JSON", message: T.invalidJson } },
      400,
    );
  }

  const validated = validatePayload(parsed, loc);
  if (!validated.ok) {
    return json(
      {
        error: {
          code: "VALIDATION",
          message: T.validationSummary,
          fieldErrors: validated.errors,
        },
      },
      400,
    );
  }

  const payload = validated.data;

  if (hasResendKeyIncompleteFromTo(env)) {
    return json(
      {
        error: { code: "RESEND_MISCONFIGURED", message: T.resendMisconfigured },
      },
      503,
    );
  }

  if (isResendReady(env)) {
    const from = env.CONTACT_FROM_EMAIL!.trim();
    const toList = env.CONTACT_TO_EMAIL!.split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const subject =
      loc === "ko"
        ? `[U:RION 문의] ${payload.name}`
        : `[U:RION Contact] ${payload.name}`;
    const html = `
      <p><strong>${loc === "ko" ? "이름" : "Name"}</strong> ${escapeHtml(payload.name)}</p>
      <p><strong>${loc === "ko" ? "이메일" : "Email"}</strong> ${escapeHtml(payload.email)}</p>
      <p><strong>${loc === "ko" ? "메시지" : "Message"}</strong></p>
      <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(payload.message)}</pre>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: toList,
        reply_to: payload.email,
        subject,
        html,
      }),
    });

    const raw = await res.text();
    let resBody: { id?: string } = {};
    try {
      resBody = JSON.parse(raw) as { id?: string };
    } catch {
      /* ignore */
    }

    if (res.ok) {
      return json({ ok: true, channel: "email", id: resBody.id });
    }
    console.error("[contact] Resend error", res.status, raw);
    return json(
      { error: { code: "EMAIL_SEND_FAILED", message: T.emailSendFailed } },
      502,
    );
  }

  const hookUrl = env.CONTACT_WEBHOOK_URL?.trim();
  if (hookUrl) {
    const res = await fetch(hookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "contact",
        ...payload,
        at: new Date().toISOString(),
      }),
    });
    if (res.ok) {
      return json({ ok: true, channel: "webhook" });
    }
    const text = await res.text();
    console.error("[contact] Webhook error", res.status, text);
  }

  return json(
    { error: { code: "NOT_CONFIGURED", message: T.notConfigured } },
    503,
  );
}
