"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ReviewWithProduct } from "@/lib/types";
import { IconCheck } from "@/components/icons";
import MediaLightbox, { type ReviewMedia } from "./MediaLightbox";

/* Збірна стрічка відгуків (усі продукти). Фільтр за продуктом + «лише з фото/відео».
   Формат «листання вниз»: показуємо порціями, підвантаження при доскролюванні
   (IntersectionObserver) + кнопка «Показати ще» як явна/доступна альтернатива. */

const PAGE = 8;

type Box = { media: ReviewMedia[]; index: number };
const mediaCount = (r: ReviewWithProduct) => r.media?.length ?? 0;

export default function ReviewsFeed({ reviews }: { reviews: ReviewWithProduct[] }) {
  const products = useMemo(() => {
    const m = new Map<string, { slug: string; name: string; count: number }>();
    for (const r of reviews) {
      const e = m.get(r.productSlug);
      if (e) e.count += 1;
      else m.set(r.productSlug, { slug: r.productSlug, name: r.productShortName ?? r.productName, count: 1 });
    }
    return [...m.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "uk"));
  }, [reviews]);

  const hasAnyMedia = reviews.some((r) => mediaCount(r) > 0);

  const [product, setProduct] = useState<string>("all");
  const [onlyMedia, setOnlyMedia] = useState(false);
  const [visible, setVisible] = useState(PAGE);
  const [box, setBox] = useState<Box | null>(null);

  const filtered = useMemo(
    () =>
      reviews.filter(
        (r) => (product === "all" || r.productSlug === product) && (!onlyMedia || mediaCount(r) > 0),
      ),
    [reviews, product, onlyMedia],
  );

  // Скидаємо лічильник видимих при зміні фільтра
  useEffect(() => setVisible(PAGE), [product, onlyMedia]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // Автопідвантаження при доскролюванні до вартового елемента
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore) return;
    const el = sentinel.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setVisible((v) => v + PAGE);
      },
      { rootMargin: "500px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, filtered.length]);

  const chip = (active: boolean) =>
    "rounded-[6px] border px-3 py-1.5 text-[12px] transition-colors " +
    (active ? "border-accent-deep bg-accent-deep/15 text-ink" : "border-edge text-ink-2 hover:border-accent");

  return (
    <div>
      {/* Панель фільтрів */}
      <div className="flex flex-col gap-3 rounded-[10px] border border-line-3 bg-surface p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setProduct("all")} className={chip(product === "all")}>
            Усі продукти <span className="text-ink-5">({reviews.length})</span>
          </button>
          {products.map((p) => (
            <button key={p.slug} type="button" onClick={() => setProduct(p.slug)} className={chip(product === p.slug)}>
              {p.name} <span className="text-ink-5">({p.count})</span>
            </button>
          ))}
        </div>

        {hasAnyMedia && (
          <label className="flex shrink-0 cursor-pointer select-none items-center gap-2 text-[12px] text-ink-3">
            <input type="checkbox" className="peer sr-only" checked={onlyMedia} onChange={(e) => setOnlyMedia(e.target.checked)} />
            <span className="flex size-[15px] items-center justify-center rounded-[3px] border border-edge transition-colors peer-checked:border-accent peer-checked:bg-accent peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-accent">
              {onlyMedia && <IconCheck className="size-2.5 text-white" />}
            </span>
            Лише з фото/відео
          </label>
        )}
      </div>

      <p className="mt-4 text-[12px] text-ink-4" aria-live="polite">
        Показано {shown.length} з {filtered.length}
      </p>

      {/* Стрічка */}
      {shown.length === 0 ? (
        <div className="mt-4 rounded-[10px] border border-dashed border-line-3 bg-surface px-6 py-12 text-center">
          <p className="text-[14px] text-ink-2">
            {reviews.length === 0 ? "Відгуків поки немає." : "За обраним фільтром відгуків немає."}
          </p>
          <p className="mt-1.5 text-[12px] text-ink-4">
            {reviews.length === 0
              ? "Ваш відгук може стати першим — залиште заявку, і ми додамо ваш досвід."
              : "Спробуйте інший продукт або зніміть фільтр."}
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 items-start gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((r, i) => (
            <ReviewCard
              key={r.productSlug + "-" + r.publishedAt + "-" + i}
              r={r}
              onOpen={(idx) => setBox({ media: r.media ?? [], index: idx })}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={sentinel} className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE)}
            className="inline-flex items-center gap-2 rounded-[8px] border border-edge px-5 py-2.5 text-[13px] font-medium text-ink-2 transition-colors hover:border-accent hover:text-ink"
          >
            Показати ще
            <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m5 9 7 7 7-7" />
            </svg>
          </button>
        </div>
      )}

      {box && (
        <MediaLightbox
          media={box.media}
          index={box.index}
          onClose={() => setBox(null)}
          onNav={(dir) => setBox((b) => (b ? { ...b, index: (b.index + dir + b.media.length) % b.media.length } : b))}
        />
      )}
    </div>
  );
}

function ReviewCard({ r, onOpen }: { r: ReviewWithProduct; onOpen: (index: number) => void }) {
  return (
    <article className="rounded-[10px] border border-line-3 bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={`/products/${r.productSlug}`}
          className="rounded-[4px] border border-chip-line px-2 py-0.5 text-[11px] text-ink-2 transition-colors hover:border-accent hover:text-accent"
        >
          {r.productShortName ?? r.productName}
        </Link>
        {r.productTypeLabel && <span className="text-[11px] text-ink-5">{r.productTypeLabel}</span>}
        {r.verified && (
          <span className="ml-auto rounded-full border border-ok/40 px-2 py-0.5 text-[10px] text-ok">Перевірено</span>
        )}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-semibold text-ink">{r.displayName}</span>
        {r.roleLabel && <span className="text-[11px] text-ink-4">· {r.roleLabel}</span>}
      </div>

      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">{r.text}</p>

      {r.media && r.media.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {r.media.map((m, mi) => (
            <button
              key={mi}
              type="button"
              onClick={() => onOpen(mi)}
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
  );
}
