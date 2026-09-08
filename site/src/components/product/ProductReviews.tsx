"use client";

import { useState } from "react";
import type { PublicReview } from "@/lib/types";
import { IconCheck } from "@/components/icons";
import MediaLightbox from "@/components/reviews/MediaLightbox";

/* Відгуки продукту з можливістю переглядати вкладені файли (фото/відео).
   Лайтбокс — спільний компонент MediaLightbox (портал у document.body). */

type Media = NonNullable<PublicReview["media"]>[number];
type Box = { media: Media[]; index: number };

const mediaCount = (r: PublicReview) => r.media?.length ?? 0;

export default function ProductReviews({ reviews }: { reviews: PublicReview[] }) {
  const hasAnyMedia = reviews.some((r) => mediaCount(r) > 0);
  const [onlyMedia, setOnlyMedia] = useState(false);
  const [box, setBox] = useState<Box | null>(null);

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

      {box && (
        <MediaLightbox
          media={box.media}
          index={box.index}
          onClose={() => setBox(null)}
          onNav={(dir) => setBox((b) => (b ? { ...b, index: (b.index + dir + b.media.length) % b.media.length } : b))}
        />
      )}
    </section>
  );
}
