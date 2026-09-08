"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import ContactForm from "@/components/contacts/ContactForm";
import { IconClose } from "@/components/icons";

/* Модалка «Зв'язатися»: та сама форма, що на /contacts, у fixed-оверлеї.
   Оверлей — через React-портал у document.body (правило проєкту: шапка має
   backdrop-filter → fixed-нащадки всередині неї рендеряться глючно на мобільних).
   Контекст дозволяє відкривати модалку з кнопки в топ-барі і з мобільного меню. */

type Ctx = { open: () => void };
const ContactDialogCtx = createContext<Ctx>({ open: () => {} });

export function useContactDialog(): Ctx {
  return useContext(ContactDialogCtx);
}

export default function ContactDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <ContactDialogCtx.Provider value={{ open: () => setOpen(true) }}>
      {children}
      {mounted && isOpen && createPortal(<ContactModal onClose={() => setOpen(false)} />, document.body)}
    </ContactDialogCtx.Provider>
  );
}

/** Кнопка, що відкриває модалку. Використовується в топ-барі. */
export function ContactTrigger({ className, children }: { className?: string; children: ReactNode }) {
  const { open } = useContactDialog();
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}

function ContactModal({ onClose }: { onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => closeRef.current?.focus(), []);

  return (
    <div className="fixed inset-0 z-[90] flex justify-center overflow-y-auto p-4 py-8 sm:items-center">
      <div aria-hidden onClick={onClose} className="fixed inset-0 bg-[#040506]/80 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-dialog-title"
        className="relative z-10 my-auto w-full max-w-[560px] rounded-[14px] border border-card-line bg-card p-5 shadow-[0_24px_70px_rgba(0,0,0,0.55)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="contact-dialog-title" className="font-display text-[20px] font-bold uppercase leading-tight text-ink">
              Зв&apos;язатися
            </h2>
            <p className="mt-1 text-[12px] leading-4 text-ink-4">
              Залиште контакти — менеджер відповість найближчим часом.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="flex size-9 shrink-0 items-center justify-center rounded-[6px] border border-edge text-ink-3 transition-colors hover:border-accent hover:text-ink"
          >
            <IconClose className="size-5" />
          </button>
        </div>

        <div className="mt-5">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
