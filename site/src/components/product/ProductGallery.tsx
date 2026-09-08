"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/types";
import MediaLightbox from "@/components/reviews/MediaLightbox";
import { IconChevronRight } from "@/components/icons";

/* Галерея фото продукту: велике фото + мініатюри. Стрілки ←/→ видно завжди (не
   лише при наведенні й не лише в оверлеї) і стоять на фіксованих місцях рамки,
   тому не рухаються при зміні пропорцій фото. Клік по фото збільшує його у
   спільному MediaLightbox (портал у document.body — правило проєкту щодо
   fixed-оверлеїв). Фото з прозорим тлом, тому object-contain. */

const ARROW =
  "absolute top-1/2 z-10 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-line " +
  "bg-inset/80 text-ink-3 transition-colors hover:border-edge hover:text-ink " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export default function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className="lg:sticky lg:top-4">
        <div className="flex aspect-[4/3] items-center justify-center rounded-[12px] border border-line bg-field text-[13px] text-ink-5">
          Фото продукту
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-[8px] border border-line bg-field" />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-ink-5">Фото буде додано власником.</p>
      </div>
    );
  }

  const current = images[active] ?? images[0];
  const multi = images.length > 1;
  const nav = (dir: number) => setActive((i) => (i + dir + images.length) % images.length);

  return (
    <div className="lg:sticky lg:top-4">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[12px] border border-line bg-field">
        <button
          type="button"
          onClick={() => setZoomed(true)}
          aria-label={`Збільшити фото: ${current.alt || name}`}
          className="group/zoom absolute inset-0 cursor-zoom-in"
        >
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt || name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 720px"
            /* поля з боків — місце під стрілки, щоб фото під них не заходило */
            className={
              "object-contain py-5 transition-transform duration-300 group-hover/zoom:scale-[1.03] " +
              (multi ? "px-14" : "px-5")
            }
          />
        </button>

        {multi && (
          <>
            <button type="button" onClick={() => nav(-1)} aria-label="Попереднє фото" className={ARROW + " left-2"}>
              <IconChevronRight className="size-5 rotate-180" />
            </button>
            <button type="button" onClick={() => nav(1)} aria-label="Наступне фото" className={ARROW + " right-2"}>
              <IconChevronRight className="size-5" />
            </button>
            <span className="pointer-events-none absolute bottom-2.5 right-3 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] text-white">
              {active + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {multi && (
        /* На вузьких екранах не більше 5 колонок — інакше мініатюри стають
           дрібнішими за комфортну область натискання (44px). */
        <div
          className="mt-3 grid gap-3 grid-cols-[repeat(var(--cols-sm),minmax(0,1fr))] sm:grid-cols-[repeat(var(--cols),minmax(0,1fr))]"
          style={
            {
              "--cols": Math.max(4, images.length),
              "--cols-sm": Math.min(Math.max(4, images.length), 5),
            } as React.CSSProperties
          }
        >
          {images.map((im, i) => (
            <button
              key={im.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Фото ${i + 1} з ${images.length}`}
              aria-pressed={i === active}
              className={
                "relative aspect-square overflow-hidden rounded-[8px] border bg-field transition-colors " +
                (i === active ? "border-accent" : "border-line hover:border-edge")
              }
            >
              <Image src={im.src} alt="" fill sizes="140px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}

      {zoomed && (
        <MediaLightbox
          media={images.map((im) => ({ type: "photo" as const, src: im.src }))}
          index={active}
          onClose={() => setZoomed(false)}
          onNav={nav}
        />
      )}
    </div>
  );
}
