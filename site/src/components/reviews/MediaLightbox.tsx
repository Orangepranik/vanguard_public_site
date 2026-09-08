"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { PublicReview } from "@/lib/types";
import { IconChevronRight, IconClose } from "@/components/icons";

/* Лайтбокс вкладень відгуку (фото/відео). Рендер — через React-портал у
   document.body: fixed-оверлеї не можна тримати всередині елементів із
   backdrop-filter (шапка) — правило проєкту. Клавіші ←/→/Esc, scroll-lock. */

export type ReviewMedia = NonNullable<PublicReview["media"]>[number];

export default function MediaLightbox({
  media,
  index,
  onClose,
  onNav,
}: {
  media: ReviewMedia[];
  index: number;
  onClose: () => void;
  onNav: (dir: number) => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") onNav(1);
      else if (e.key === "ArrowLeft") onNav(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onNav]);

  if (!mounted) return null;
  const m = media[index];
  if (!m) return null;
  const multi = media.length > 1;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-[#040506]/85 backdrop-blur-sm" />
      <div role="dialog" aria-modal="true" aria-label="Перегляд вкладення" className="relative z-10">
        {m.type === "video" ? (
          <video src={m.src} poster={m.poster} controls autoPlay playsInline className="max-h-[86vh] max-w-[92vw] rounded-[10px]" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.src} alt="" className="max-h-[86vh] max-w-[92vw] rounded-[10px] object-contain" />
        )}

        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити"
          className="absolute -right-3 -top-3 flex size-9 items-center justify-center rounded-full border border-line bg-inset text-ink-2 transition-colors hover:text-ink"
        >
          <IconClose className="size-5" />
        </button>

        {multi && (
          <>
            <button
              type="button"
              onClick={() => onNav(-1)}
              aria-label="Попереднє"
              className="absolute left-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-inset/80 text-ink-2 transition-colors hover:text-ink"
            >
              <IconChevronRight className="size-5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => onNav(1)}
              aria-label="Наступне"
              className="absolute right-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-inset/80 text-ink-2 transition-colors hover:text-ink"
            >
              <IconChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] text-white">
              {index + 1} / {media.length}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
