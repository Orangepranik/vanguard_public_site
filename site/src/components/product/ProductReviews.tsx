"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { PublicReview } from "@/lib/types";
import { IconCheck, IconChevronRight, IconClose } from "@/components/icons";

/* Відгуки продукту з можливістю переглядати вкладені файли (фото/відео).
   Лайтбокс — через React-портал у document.body (правило проєкту щодо fixed-оверлеїв). */

type Media = NonNullable<PublicReview["media"]>[number];
type Box = { media: Media[]; index: number };

const mediaCount = (r: PublicReview) => r.media?.length ?? 0;

export default function ProductReviews({ reviews }: { reviews: PublicReview[] }) {
  const hasAnyMedia = reviews.some((r) => mediaCount(r) > 0);
  const [onlyMedia, setOnlyMedia] = useState(false);
  const [box, setBox] = useState<Box | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!box) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBox(null);
      else if (e.key === "ArrowRight") setBox((b) => (b ? { ...b, index: (b.index + 1) % b.media.length } : b));
      else if (e.key === "ArrowLeft") setBox((b) => (b ? { ...b, index: (b.index - 1 + b.media.length) % b.media.length } : b));
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [box]);

  const shown = onlyMedia ? reviews.filter((r) => mediaCount(r) > 0) : reviews;

  return (
    <section aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="reviews-heading" className="font-display text-[18px] font-bold uppercase leading-tight text-ink">
          Відгуки та досвід застосування
        </h2>
        {hasAnyMedia && (
          <label className="flex cursor-pointer select-none items-center gap-2 text-[12px] text-ink-3">
            <input type="checkbox" className="peer sr-only" checked={onlyMedia} onChange={(e) => setOnlyMedia(e.target.checked)} />
            <span className="flex size-[15px] items-center justify-center rounded-[3px] border border-edge transition-colors peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-accent">
              {onlyMedia && <IconCheck className="size-2.5 text-white" />}
            </span>
            Лише з фото/відео
          </label>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {shown.map((r, i) => (
          <article key={i} className="rounded-[10px] border border-line-3 bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] font-semibold text-ink">{r.displayName}</span>
              {r.roleLabel && <span className="text-[11px] text-ink-4">· {r.roleLabel}</span>}
              {r.verified && (
                <span className="ml-auto rounded-full border border-ok/40 px-2 py-0.5 text-[10px] text-ok">Перевірено</span>
              )}
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-2">{r.text}</p>

            {r.media && r.media.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {r.media.map((m, mi) => (
                  <button
                    key={mi}
                    type="button"
                    onClick={() => setBox({ media: r.media!, index: mi })}
                    aria-label={m.type === "video" ? "Переглянути відео" : "Переглянути фото"}
                    className="group relative size-16 overflow-hidden rounded-[8px] border border-line-3"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.type === "video" ? m.poster ?? m.src : m.src}
                      alt=""
                      className="size-full object-cover transition-transform group-hover:scale-105"
                    />
                    {m.type === "video" && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/35">
                        <svg viewBox="0 0 24 24" className="size-6 text-white" fill="currentColor" aria-hidden>
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-ink-5">
              {r.useCaseTag && <span>{r.useCaseTag}</span>}
              <span>{r.publishedAt}</span>
            </div>
          </article>
        ))}
      </div>

      {mounted &&
        box &&
        createPortal(
          <Lightbox
            box={box}
            onClose={() => setBox(null)}
            onNav={(dir) => setBox((b) => (b ? { ...b, index: (b.index + dir + b.media.length) % b.media.length } : b))}
          />,
          document.body,
        )}
    </section>
  );
}

function Lightbox({ box, onClose, onNav }: { box: Box; onClose: () => void; onNav: (dir: number) => void }) {
  const m = box.media[box.index];
  const multi = box.media.length > 1;
  return (
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
              {box.index + 1} / {box.media.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
