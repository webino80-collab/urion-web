"use client";

import { useEffect, useState } from "react";
import { getContactPostUrl } from "@/lib/contact-endpoint";
import { useI18n } from "./I18nProvider";

type FieldErrors = Partial<Record<"name" | "email" | "message", string[]>>;

export type ContactSectionProps = {
  /** 모달 안에서 사용할 때 닫기·Escape */
  embedded?: boolean;
  onClose?: () => void;
};

export function ContactSection({
  embedded = false,
  onClose,
}: ContactSectionProps) {
  const { locale, t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const site = t.contactSite;
  const idp = embedded ? "contact-modal" : "contact-landing";

  const resetForm = () => {
    setName("");
    setEmail("");
    setMessage("");
    setStatus("idle");
    setFormError(null);
    setFieldErrors({});
  };

  useEffect(() => {
    if (!embedded || !onClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "loading") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [embedded, onClose, status]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setFormError(null);
    setFieldErrors({});

    try {
      const res = await fetch(getContactPostUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-locale": locale,
        },
        body: JSON.stringify({ name, email, message }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        error?: { code?: string; message?: string; fieldErrors?: FieldErrors };
      };

      if (!res.ok) {
        if (data.error?.fieldErrors) {
          setFieldErrors(data.error.fieldErrors);
        }
        setFormError(
          data.error?.message ??
            (res.status === 503 ? t.contact.err503 : t.contact.errGeneric),
        );
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setFormError(t.contact.errNetwork);
      setStatus("error");
    }
  }

  const titleId = `${idp}-title`;

  return (
    <div className="text-zinc-100">
      <div
        className={
          embedded
            ? "border-b border-white/5 px-0 pb-5 pt-0 sm:pb-6"
            : "shrink-0 border-b border-white/10 px-0 pb-4 pt-1 sm:px-0"
        }
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2
              id={titleId}
              className="text-xl font-semibold tracking-tight text-white sm:text-2xl"
            >
              {t.contact.title}
            </h2>
            <p className="mt-1 text-base text-zinc-400">{t.contact.subtitle}</p>
          </div>
          {embedded && onClose ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={status === "loading"}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 disabled:pointer-events-none disabled:opacity-40"
                aria-label={t.contact.closeAria}
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {status === "success" ? (
        <div className="px-0 py-8 text-center sm:px-0">
          <p className="text-lg font-medium text-white">
            {t.contact.successTitle}
          </p>
          <p className="mt-2 text-base text-zinc-400">{t.contact.successSub}</p>
          <button
            type="button"
            onClick={() => {
              resetForm();
              if (embedded) onClose?.();
            }}
            className="mt-8 inline-flex min-h-12 w-full max-w-sm items-center justify-center rounded-[10px] border border-white/15 bg-white/5 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
          >
            {t.contact.close}
          </button>
        </div>
      ) : (
        <div className="grid gap-0 lg:grid-cols-2 lg:gap-0">
          <aside className="order-2 border-t border-white/5 px-0 py-6 sm:px-0 sm:py-8 lg:order-1 lg:border-t-0">
            <div className="space-y-[42px]">
              <section aria-labelledby={`${idp}-directions-heading`}>
                <h3
                  id={`${idp}-directions-heading`}
                  className="text-sm font-semibold uppercase tracking-wider text-violet-400"
                >
                  {t.contact.directions}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-zinc-300">
                  {site.address}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex min-h-12 items-center justify-center rounded-full border border-violet-400/55 bg-transparent px-4 py-2 text-base font-medium leading-normal tracking-wide text-violet-300 transition-[color,border-color,box-shadow] hover:border-violet-300 hover:text-violet-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                >
                  {t.contact.mapLink}
                </a>
              </section>
            </div>
          </aside>

          <div className="order-1 px-0 py-6 sm:px-0 sm:py-8 lg:order-2">
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit}
              noValidate
            >
              {formError ? (
                <p
                  role="alert"
                    className="rounded-[10px] border border-red-500/30 bg-red-950/40 px-4 py-3 text-base text-red-200"
                >
                  {formError}
                </p>
              ) : null}

              <div>
                <label
                  htmlFor={`${idp}-name`}
                  className="mb-1.5 block text-sm font-medium uppercase tracking-wider text-zinc-500"
                >
                  {t.contact.name}
                </label>
                <input
                  id={`${idp}-name`}
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  disabled={status === "loading"}
                  aria-invalid={Boolean(fieldErrors.name?.length)}
                  aria-describedby={
                    fieldErrors.name?.length ? `${idp}-name-error` : undefined
                  }
                  className="box-border min-h-12 w-full rounded-[10px] border border-white/10 bg-zinc-900/80 px-4 py-3 text-base leading-normal text-white placeholder:text-zinc-600 outline-none transition-[border-color,box-shadow] focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25 disabled:opacity-50"
                    placeholder={t.contact.placeholderName}
                />
                {fieldErrors.name?.[0] ? (
                  <p
                    id={`${idp}-name-error`}
                    className="mt-1.5 text-sm text-red-400"
                  >
                    {fieldErrors.name[0]}
                  </p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor={`${idp}-email`}
                  className="mb-1.5 block text-sm font-medium uppercase tracking-wider text-zinc-500"
                >
                  {t.contact.email}
                </label>
                <input
                  id={`${idp}-email`}
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={status === "loading"}
                  aria-invalid={Boolean(fieldErrors.email?.length)}
                  aria-describedby={
                    fieldErrors.email?.length ? `${idp}-email-error` : undefined
                  }
                  className="box-border min-h-12 w-full rounded-[10px] border border-white/10 bg-zinc-900/80 px-4 py-3 text-base leading-normal text-white placeholder:text-zinc-600 outline-none transition-[border-color,box-shadow] focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25 disabled:opacity-50"
                    placeholder={t.contact.placeholderEmail}
                />
                {fieldErrors.email?.[0] ? (
                  <p
                    id={`${idp}-email-error`}
                    className="mt-1.5 text-sm text-red-400"
                  >
                    {fieldErrors.email[0]}
                  </p>
                ) : null}
              </div>
              <div>
                <label
                  htmlFor={`${idp}-message`}
                  className="mb-1.5 block text-sm font-medium uppercase tracking-wider text-zinc-500"
                >
                  {t.contact.message}
                </label>
                <textarea
                  id={`${idp}-message`}
                  name="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  disabled={status === "loading"}
                  aria-invalid={Boolean(fieldErrors.message?.length)}
                  aria-describedby={
                    fieldErrors.message?.length
                      ? `${idp}-message-error`
                      : undefined
                  }
                  className="box-border min-h-[12rem] w-full resize-none rounded-[10px] border border-white/10 bg-zinc-900/80 px-4 py-3 text-base leading-normal text-white placeholder:text-zinc-600 outline-none transition-[border-color,box-shadow] focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25 disabled:opacity-50"
                    placeholder={t.contact.placeholderMessage}
                />
                {fieldErrors.message?.[0] ? (
                  <p
                    id={`${idp}-message-error`}
                    className="mt-1.5 text-sm text-red-400"
                  >
                    {fieldErrors.message[0]}
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-[10px] bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-base font-semibold leading-normal text-white shadow-lg shadow-violet-950/40 transition-[filter,transform] hover:brightness-110 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-60"
              >
                {status === "loading" ? t.contact.submitting : t.contact.submit}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
