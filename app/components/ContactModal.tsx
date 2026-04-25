"use client";

import { useEffect } from "react";
import { ContactSection } from "./ContactSection";

type ContactModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ContactModal({ open, onClose }: ContactModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center px-6 py-6 sm:px-10 sm:py-10"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
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
        className="relative max-h-[min(90vh,860px)] w-full max-w-lg overflow-y-auto rounded-[10px] border border-white/10 bg-zinc-950/95 py-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_25px_50px_-12px_rgba(0,0,0,0.85)] sm:py-8 lg:max-w-4xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ContactSection embedded onClose={onClose} />
      </div>
    </div>
  );
}
