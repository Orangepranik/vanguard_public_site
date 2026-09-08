"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { PublicReview } from "@/lib/types";
import { IconChevronRight, IconClose } from "@/components/icons";

/* Лайтбокс вкладень відгуку (фото/відео). Рендер — через React-портал у
   document.body: fixed-оверлеї не можна тримати всередині елементів із
   backdrop-filter (шапка) — правило проєкту. Клавіші ←/→/Esc, scroll-lock. */

export type ReviewMedia = NonNullable<PublicReview["media"]>[number];

const BTN =
  "flex items-center justify-center rounded-full border border-line bg-inset/80 text-ink-2 " +
  "transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

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
    <div className="fixed inset-0 z-[80]">
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-[#040506]/85 backdrop-blur-sm" />

      {/* Кнопки прив'язані до вікна, а не до вкладення: їх позиція однакова для
          будь-яких пропорцій файлу. Сцена — фіксована рамка, всередині якої
          вкладення вписується (object-contain), тож нічого не «стрибає». */}
      <div role="dialog" aria-modal="true" aria-label="Перегляд вкладення" className="pointer-events-none absolute inset-0">
        <div
          className={
            "absolute inset-0 flex items-center justify-center pb-16 pt-16 " +
            (multi ? "px-14 sm:px-20" : "px-4")
          }
        >
          {m.type === "video" ? (
            <video
              src={m.src}
              poster={m.poster}
              controls
              autoPlay
              playsInline
              className="pointer-events-auto max-h-full max-w-full rounded-[10px]"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={m.src} alt="" className="pointer-events-auto max-h-full max-w-full rounded-[10px] object-contain" />
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити"
          className={BTN + " pointer-events-auto absolute right-4 top-4 size-9"}
        >
          <IconClose className="size-5" />
        </button>

        {multi && (
          <>
            <button
              type="button"
              onClick={() => onNav(-1)}
              aria-label="Попереднє"
              className={BTN + " pointer-events-auto absolute left-3 top-1/2 size-10 -translate-y-1/2 sm:left-5"}
            >
              <IconChevronRight className="size-5 rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => onNav(1)}
              aria-label="Наступне"
              className={BTN + " pointer-events-auto absolute right-3 top-1/2 size-10 -translate-y-1/2 sm:right-5"}
            >
              <IconChevronRight className="size-5" />
            </button>
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] text-white">
              {index + 1} / {media.length}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
