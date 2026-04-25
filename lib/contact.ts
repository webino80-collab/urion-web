import { z } from "zod";
import type { Locale } from "@/lib/i18n/locale";

const ko = {
  nameRequired: "이름을 입력해 주세요.",
  nameTooLong: "이름이 너무 깁니다.",
  emailRequired: "이메일을 입력해 주세요.",
  emailInvalid: "올바른 이메일 형식이 아닙니다.",
  emailTooLong: "이메일이 너무 깁니다.",
  messageRequired: "메시지를 입력해 주세요.",
  messageTooLong: "메시지는 5,000자 이하로 작성해 주세요.",
} as const;

const en = {
  nameRequired: "Please enter your name.",
  nameTooLong: "Name is too long.",
  emailRequired: "Please enter your email.",
  emailInvalid: "Enter a valid email address.",
  emailTooLong: "Email is too long.",
  messageRequired: "Please enter a message.",
  messageTooLong: "Message must be 5,000 characters or less.",
} as const;

export function getContactPayloadSchema(locale: Locale) {
  const m = locale === "en" ? en : ko;
  return z.object({
    name: z.string().trim().min(1, m.nameRequired).max(120, m.nameTooLong),
    email: z
      .string()
      .trim()
      .min(1, m.emailRequired)
      .email(m.emailInvalid)
      .max(254, m.emailTooLong),
    message: z
      .string()
      .trim()
      .min(1, m.messageRequired)
      .max(5000, m.messageTooLong),
  });
}

export type ContactPayload = z.infer<ReturnType<typeof getContactPayloadSchema>>;

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
