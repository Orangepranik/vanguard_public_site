"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { IconBurger, IconClose } from "./icons";

type NavItem = { label: string; href: string };

/**
 * Мобільна навігація (< lg): бургер у правому куті шапки відкриває
 * висувну панель справа. Закриття: хрестик, клік по фону, Esc.
 */
export default function MobileMenu({
  items,
  active,
}: {
  items: NavItem[];
  active: string;
}) {
  const [open, setOpen] = useState(false);
  // Портал монтуємо лише в браузері (на SSR document недоступний)
  const [mounted, setMounted] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label="Відкрити меню"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex size-11 items-center justify-center rounded-[3px] text-ink transition-colors hover:bg-surface"
      >
        <IconBurger className="size-[22px]" />
      </button>

      {/* Оверлей рендеримо порталом у document.body: шапка має backdrop-blur,
          який робить її containing block для fixed-нащадків — усередині неї
          панель на мобільних рендериться некоректно (текст не малюється). */}
      {mounted &&
        createPortal(
          <MenuOverlay
            open={open}
            onClose={() => setOpen(false)}
            items={items}
            active={active}
            closeRef={closeRef}
          />,
          document.body,
        )}
    </div>
  );
}

function MenuOverlay({
  open,
  onClose,
  items,
  active,
  closeRef,
}: {
  open: boolean;
  onClose: () => void;
  items: NavItem[];
  active: string;
  closeRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="xl:hidden">
      {/* Бекдроп */}
      <div
        aria-hidden
        onClick={onClose}
        className={
          "fixed inset-0 z-[60] bg-[#040506]/70 transition-opacity duration-200 motion-reduce:transition-none " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
      />

      {/* Висувна панель */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Навігація"
        className={
          "fixed right-0 top-0 z-[70] flex h-dvh w-[290px] max-w-[85vw] flex-col border-l border-line bg-inset transition-transform duration-200 ease-out motion-reduce:transition-none " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="flex h-[66px] shrink-0 items-center justify-between border-b border-line-3 pl-5 pr-3">
          <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-4">
            Меню
          </span>
          <button
            ref={closeRef}
            type="button"
            aria-label="Закрити меню"
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded-[3px] text-ink-2 transition-colors hover:bg-surface hover:text-ink"
          >
            <IconClose className="size-5" />
          </button>
        </div>

        <nav
          aria-label="Мобільна навігація"
          className="flex-1 overflow-y-auto px-3 py-3"
        >
          {items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={onClose}
              className={
                "block rounded-[3px] px-3 py-3.5 text-[16px] font-medium leading-none transition-colors " +
                (item.label === active
                  ? "text-accent-deep"
                  : "text-ink-2 hover:bg-surface hover:text-ink")
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="shrink-0 border-t border-line-3 px-5 py-4">
          <Link
            href="#request"
            onClick={onClose}
            className="flex h-11 items-center justify-center rounded-[3px] border border-accent-deep text-[15px] font-semibold text-[#F3F3F3] transition-colors hover:bg-accent-deep/15"
          >
            Зв&apos;язатися
          </Link>
          <div className="mt-3 flex flex-col gap-1.5 text-[12px] text-ink-4">
            <a
              href="tel:+380608403520"
              className="transition-colors hover:text-ink-2"
            >
              +38 (060) 840 35 20
            </a>
            <a href="#" className="transition-colors hover:text-ink-2">
              @VANGUARDSALE
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}
