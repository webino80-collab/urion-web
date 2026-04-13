import { Resend } from "resend";
import { escapeHtml, type ContactPayload } from "@/lib/contact";

export function isResendFullyConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.CONTACT_FROM_EMAIL?.trim() &&
      process.env.CONTACT_TO_EMAIL?.trim(),
  );
}

export function hasResendApiKeyButIncompleteFromTo(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      (!process.env.CONTACT_FROM_EMAIL?.trim() ||
        !process.env.CONTACT_TO_EMAIL?.trim()),
  );
}

function parseToList(raw: string): string[] {
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export type SendContactEmailResult =
  | { ok: true; id: string }
  | { ok: false; code: "SEND_FAILED"; message: string };

export async function sendContactEmailViaResend(
  payload: ContactPayload,
): Promise<SendContactEmailResult> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.CONTACT_FROM_EMAIL?.trim();
  const toRaw = process.env.CONTACT_TO_EMAIL?.trim();

  if (!apiKey || !from || !toRaw) {
    return {
      ok: false,
      code: "SEND_FAILED",
      message: "Resend 환경 변수가 올바르지 않습니다.",
    };
  }

  const to = parseToList(toRaw);
  if (to.length === 0) {
    return {
      ok: false,
      code: "SEND_FAILED",
      message: "수신 이메일(CONTACT_TO_EMAIL)이 비어 있습니다.",
    };
  }

  const resend = new Resend(apiKey);

  const html = `<p><strong>${escapeHtml(payload.name)}</strong> &lt;${escapeHtml(payload.email)}&gt;</p><p>${escapeHtml(payload.message).replace(/\n/g, "<br/>")}</p>`;
  const text = `${payload.name} <${payload.email}>\n\n${payload.message}`;

  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo: payload.email,
    subject: `[문의] ${payload.name}`,
    html,
    text,
    tags: [{ name: "source", value: "contact-form" }],
  });

  if (error) {
    console.error("[contact] Resend error", error.name, error.message, error.statusCode);
    return {
      ok: false,
      code: "SEND_FAILED",
      message: error.message,
    };
  }

  return { ok: true, id: data?.id ?? "" };
}
