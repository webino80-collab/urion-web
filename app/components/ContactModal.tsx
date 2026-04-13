"use client";

import { useEffect, useState } from "react";
import { getPublicContactPostUrl } from "@/lib/contact-endpoint";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "./I18nProvider";

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
};

type FieldErrors = Partial<Record<"name" | "email" | "message", string[]>>;

export function ContactModal({ open, onClose }: ContactModalProps) {
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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && status !== "loading") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, status]);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setName("");
      setEmail("");
      setMessage("");
      setStatus("idle");
      setFormError(null);
      setFieldErrors({});
    });
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setFormError(null);
    setFieldErrors({});

    const endpoint = getPublicContactPostUrl();
    if (!endpoint) {
      setFormError(t.contact.errContactEndpointMissing);
      setStatus("error");
      return;
    }

    try {
      const res = await fetch(endpoint, {
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

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && status !== "loading") onClose();
      }}
    >
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-md"
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
        className="relative max-h-[min(90vh,860px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-zinc-950/95 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_25px_50px_-12px_rgba(0,0,0,0.85)] lg:max-w-4xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="border-b border-white/5 p-6 pb-5 sm:p-8 sm:pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2
                id="contact-modal-title"
                className="text-xl font-semibold tracking-tight text-white"
              >
                {t.contact.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-400">{t.contact.subtitle}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LanguageSwitcher />
            <button
              type="button"
              onClick={onClose}
              disabled={status === "loading"}
              className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/80 disabled:pointer-events-none disabled:opacity-40"
              aria-label={t.contact.closeAria}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            </div>
          </div>
        </div>

        {status === "success" ? (
          <div className="p-6 py-8 text-center sm:p-8">
            <p className="text-lg font-medium text-white">
              {t.contact.successTitle}
            </p>
            <p className="mt-2 text-sm text-zinc-400">{t.contact.successSub}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-8 w-full rounded-xl border border-white/15 bg-white/5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60"
            >
              {t.contact.close}
            </button>
          </div>
        ) : (
          <div className="grid gap-0 lg:grid-cols-2 lg:gap-0">
            <aside className="order-2 border-t border-white/5 p-6 sm:p-8 lg:order-1 lg:border-r lg:border-t-0">
              <div className="space-y-8">
                <section aria-labelledby="contact-directions-heading">
                  <h3
                    id="contact-directions-heading"
                    className="text-xs font-semibold uppercase tracking-wider text-violet-400"
                  >
                    {t.contact.directions}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                    {site.address}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {site.directions}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex text-sm font-medium text-violet-400 underline-offset-2 hover:text-violet-300 hover:underline"
                  >
                    {t.contact.mapLink}
                  </a>
                </section>
                <section aria-labelledby="contact-info-heading">
                  <h3
                    id="contact-info-heading"
                    className="text-xs font-semibold uppercase tracking-wider text-violet-400"
                  >
                    {t.contact.contactInfo}
                  </h3>
                  <ul className="mt-3 space-y-3 text-sm text-zinc-300">
                    <li>
                      <span className="block text-xs text-zinc-500">
                        {t.contact.phoneLabel}
                      </span>
                      <a
                        href={`tel:${site.phone.replace(/\D/g, "")}`}
                        className="mt-0.5 inline-block text-white hover:text-violet-300"
                      >
                        {site.phone}
                      </a>
                    </li>
                    <li>
                      <span className="block text-xs text-zinc-500">
                        {t.contact.emailLabel}
                      </span>
                      <a
                        href={`mailto:${site.email}`}
                        className="mt-0.5 inline-block break-all text-white hover:text-violet-300"
                      >
                        {site.email}
                      </a>
                    </li>
                    <li>
                      <span className="block text-xs text-zinc-500">
                        {t.contact.hoursLabel}
                      </span>
                      <span className="mt-0.5 block text-zinc-400">
                        {site.hours}
                      </span>
                    </li>
                  </ul>
                </section>
              </div>
            </aside>

            <div className="order-1 p-6 sm:p-8 lg:order-2">
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit}
                noValidate
              >
                {formError ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200"
                  >
                    {formError}
                  </p>
                ) : null}

                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
                  >
                    {t.contact.name}
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    disabled={status === "loading"}
                    aria-invalid={Boolean(fieldErrors.name?.length)}
                    aria-describedby={
                      fieldErrors.name?.length ? "contact-name-error" : undefined
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-[border-color,box-shadow] focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25 disabled:opacity-50"
                    placeholder={t.contact.placeholderName}
                  />
                  {fieldErrors.name?.[0] ? (
                    <p
                      id="contact-name-error"
                      className="mt-1.5 text-xs text-red-400"
                    >
                      {fieldErrors.name[0]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
                  >
                    {t.contact.email}
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    disabled={status === "loading"}
                    aria-invalid={Boolean(fieldErrors.email?.length)}
                    aria-describedby={
                      fieldErrors.email?.length
                        ? "contact-email-error"
                        : undefined
                    }
                    className="w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-[border-color,box-shadow] focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25 disabled:opacity-50"
                    placeholder={t.contact.placeholderEmail}
                  />
                  {fieldErrors.email?.[0] ? (
                    <p
                      id="contact-email-error"
                      className="mt-1.5 text-xs text-red-400"
                    >
                      {fieldErrors.email[0]}
                    </p>
                  ) : null}
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500"
                  >
                    {t.contact.message}
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={4}
                    disabled={status === "loading"}
                    aria-invalid={Boolean(fieldErrors.message?.length)}
                    aria-describedby={
                      fieldErrors.message?.length
                        ? "contact-message-error"
                        : undefined
                    }
                    className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-[border-color,box-shadow] focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/25 disabled:opacity-50"
                    placeholder={t.contact.placeholderMessage}
                  />
                  {fieldErrors.message?.[0] ? (
                    <p
                      id="contact-message-error"
                      className="mt-1.5 text-xs text-red-400"
                    >
                      {fieldErrors.message[0]}
                    </p>
                  ) : null}
                </div>
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mt-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-950/40 transition-[filter,transform] hover:brightness-110 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:pointer-events-none disabled:opacity-60"
                >
                  {status === "loading" ? t.contact.submitting : t.contact.submit}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
