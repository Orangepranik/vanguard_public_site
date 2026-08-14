"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Category, PublicProduct } from "@/lib/types";
import { AVAILABILITY_LABELS } from "@/lib/types";
import { productsPlural } from "@/lib/format";
import {
  IconArrowRight,
  IconBookmark,
  IconCheck,
  IconChevronDown,
  IconGrid,
  IconList,
  IconReset,
} from "@/components/icons";

type Sort = "popular" | "price_asc" | "price_desc";
type View = "grid" | "list";

function priceValue(p: PublicProduct): number {
  return p.publicPrice.type === "on_request"
    ? Number.MAX_SAFE_INTEGER
    : p.publicPrice.amount;
}

/* Картка продукту — точно за Figma catalog_page, символ "Product Card / Large" */

function dotClass(a: PublicProduct["availability"]): string {
  switch (a) {
    case "in_stock":
      return "bg-status-ok";
    case "production_3_5d":
    case "on_order":
      return "bg-warn";
    case "temporarily_unavailable":
      return "bg-bad";
    case "check_with_manager":
      return "bg-ink-4";
  }
}

function CardStatus({ a }: { a: PublicProduct["availability"] }) {
  return (
    <span className="flex items-center gap-1.5 text-[10px] leading-none text-[#D2D5D7]">
      <span aria-hidden className={"size-2 rounded-full " + dotClass(a)} />
      {AVAILABILITY_LABELS[a]}
    </span>
  );
}

function CategoryBadge({ name }: { name: string }) {
  return (
    <span className="rounded-[2px] bg-badge px-2 py-1 text-[9px] font-medium uppercase leading-3 tracking-wide text-[#CFD2D4]">
      {name}
    </span>
  );
}

function TagChips({ p }: { p: PublicProduct }) {
  const tags = p.cardTags ?? p.keySpecs.slice(0, 3).map((s) => s.value);
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          className="rounded-[2px] border border-chip-line px-2 py-[3px] text-[9px] leading-[13px] text-[#D4D6D8]"
        >
          {t}
        </span>
      ))}
    </div>
  );
}

function BookmarkButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      type="button"
      aria-label={saved ? "Прибрати із збережених" : "Зберегти"}
      aria-pressed={saved}
      onClick={() => setSaved((v) => !v)}
      className={
        "absolute right-3 top-3 z-10 flex size-7 items-center justify-center transition-colors " +
        (saved ? "text-details" : "text-ink-4 hover:text-ink-2")
      }
    >
      <IconBookmark filled={saved} className="size-4" />
    </button>
  );
}

function DetailsLink() {
  return (
    <span className="flex items-center gap-1.5 text-[11px] font-medium leading-[14px] text-details transition-colors group-hover:text-accent-mid">
      Детальніше
      <IconArrowRight className="size-4" />
    </span>
  );
}

function ProductPhoto({ className }: { className: string }) {
  return (
    <div
      className={
        "flex items-center justify-center text-[10px] text-ink-5 " + className
      }
    >
      Фото продукту
    </div>
  );
}

function CardGrid({ p }: { p: PublicProduct }) {
  return (
    <article className="group relative overflow-hidden rounded-[10px] border border-card-line bg-card transition-colors hover:border-edge">
      <BookmarkButton />
      <Link href={`/products/${p.slug}`} className="flex h-full flex-col">
        <div className="relative flex h-[152px] items-center justify-center">
          <span className="absolute left-3.5 top-3">
            <CategoryBadge name={p.category.name} />
          </span>
          <ProductPhoto className="h-[128px] w-[130px]" />
        </div>
        <div className="flex flex-1 flex-col gap-[7px] px-3.5 pb-3.5 pt-[15px]">
          <div>
            <h3 className="font-display text-[17px] font-bold uppercase leading-5 text-[#F1F1F1]">
              {p.shortName ?? p.name}
            </h3>
            <p className="mt-1 text-[11px] leading-[15px] text-[#B3B7BA]">
              {p.typeLabel ?? p.category.name}
            </p>
          </div>
          <TagChips p={p} />
          <div className="mt-auto flex items-center justify-between pt-1.5">
            <CardStatus a={p.availability} />
            <DetailsLink />
          </div>
        </div>
      </Link>
    </article>
  );
}

function CardList({ p }: { p: PublicProduct }) {
  return (
    <article className="group relative overflow-hidden rounded-[10px] border border-card-line bg-card transition-colors hover:border-edge">
      <BookmarkButton />
      <Link href={`/products/${p.slug}`} className="flex">
        <div className="relative flex w-[150px] shrink-0 items-center justify-center sm:w-[200px]">
          <ProductPhoto className="h-[120px] w-[122px]" />
        </div>
        <div className="flex flex-1 flex-col gap-[7px] px-3.5 py-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-display text-[17px] font-bold uppercase leading-5 text-[#F1F1F1]">
              {p.shortName ?? p.name}
            </h3>
            <CategoryBadge name={p.category.name} />
          </div>
          <p className="text-[11px] leading-[15px] text-[#B3B7BA]">
            {p.typeLabel ?? p.category.name} · {p.shortDescription}
          </p>
          <TagChips p={p} />
          <div className="mt-auto flex items-center justify-between pt-1.5">
            <CardStatus a={p.availability} />
            <DetailsLink />
          </div>
        </div>
      </Link>
    </article>
  );
}

export default function CatalogView({
  products,
  categories,
  title,
  description,
}: {
  products: PublicProduct[];
  categories: Category[];
  title: string;
  description: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [equipmentOpen, setEquipmentOpen] = useState(true);
  const [sort, setSort] = useState<Sort>("popular");
  const [view, setView] = useState<View>("grid");

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) {
      m.set(p.category.slug, (m.get(p.category.slug) ?? 0) + 1);
    }
    return m;
  }, [products]);

  const shown = useMemo(() => {
    const filtered =
      selected.length === 0
        ? products
        : products.filter((p) => selected.includes(p.category.slug));
    if (sort === "popular") return filtered;
    return [...filtered].sort((a, b) =>
      sort === "price_asc"
        ? priceValue(a) - priceValue(b)
        : priceValue(b) - priceValue(a),
    );
  }, [products, selected, sort]);

  const toggle = (slug: string) =>
    setSelected((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  return (
    <>
      {/* Рядок заголовка: зліва PAGE TITLE, справа Filters_Sort — як у макеті (y84 / y162) */}
      <div className="mt-[14px] flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
        <div>
          <h1 className="font-display text-[30px] font-bold uppercase leading-9 tracking-wide text-[#F2F3F4]">
            {title}
          </h1>
          <p className="mt-2 max-w-[420px] text-[12px] leading-[18px] text-ink-3">
            {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex overflow-hidden rounded-[3px] border border-edge bg-inset">
            <button
              type="button"
              aria-label="Вигляд сіткою"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
              className={
                "flex h-9 w-[46px] items-center justify-center border-r border-edge transition-colors " +
                (view === "grid" ? "text-accent-mid" : "text-ink-4 hover:text-ink-2")
              }
            >
              <IconGrid className="size-[22px]" />
            </button>
            <button
              type="button"
              aria-label="Вигляд списком"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
              className={
                "flex h-9 w-[46px] items-center justify-center transition-colors " +
                (view === "list" ? "text-accent-mid" : "text-ink-4 hover:text-ink-2")
              }
            >
              <IconList className="size-5" />
            </button>
          </div>

          <label className="flex items-center gap-2.5">
            <span className="text-[12px] leading-[14px] text-ink-4">
              Сортування:
            </span>
            <span className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-[38px] appearance-none rounded-[3px] border border-edge bg-field pl-3.5 pr-8 text-[12px] text-ink"
              >
                <option value="popular">Популярні</option>
                <option value="price_asc">Ціна: зростання</option>
                <option value="price_desc">Ціна: спадання</option>
              </select>
              <IconChevronDown
                aria-hidden
                className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-3"
              />
            </span>
          </label>

          <span className="text-[10px] leading-[14px] text-ink-4">
            Знайдено: {productsPlural(shown.length)}
          </span>
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[246px_1fr] lg:items-start lg:gap-6">
      {/* Панель фільтрів — за Figma-фреймом "Filters" */}
      <aside className="rounded-[4px] border border-line bg-surface p-4 lg:sticky lg:top-[82px]">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold leading-[18px] tracking-wide">
            ФІЛЬТРИ
          </h2>
          <button
            type="button"
            onClick={() => setSelected([])}
            className="flex items-center gap-1.5 text-[10px] leading-[14px] text-ink-4 transition-colors hover:text-ink-2"
          >
            Скинути все
            <IconReset className="size-3.5" />
          </button>
        </div>

        <div aria-hidden className="my-3.5 h-px bg-line" />

        <button
          type="button"
          onClick={() => setEquipmentOpen((v) => !v)}
          aria-expanded={equipmentOpen}
          className="flex w-full items-center justify-between"
        >
          <span className="text-[12px] font-medium leading-[18px] text-[#E5E7E8]">
            Тип обладнання
          </span>
          <IconChevronDown
            className={
              "size-3.5 text-ink-3 transition-transform " +
              (equipmentOpen ? "" : "-rotate-90")
            }
          />
        </button>

        {equipmentOpen && (
          <div className="mt-3 flex flex-col gap-[7px]">
            {categories.map((c) => {
              const count = counts.get(c.slug) ?? 0;
              const checked = selected.includes(c.slug);
              return (
                <button
                  key={c.slug}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => toggle(c.slug)}
                  disabled={count === 0 && !checked}
                  className="flex min-h-[18px] w-full items-center gap-2 text-left disabled:cursor-default"
                >
                  <span
                    aria-hidden
                    className={
                      "flex size-3.5 shrink-0 items-center justify-center rounded-[2px] " +
                      (checked
                        ? "bg-accent"
                        : "border border-ink-5")
                    }
                  >
                    {checked && <IconCheck className="size-2.5 text-white" />}
                  </span>
                  <span
                    className={
                      "text-[12px] font-medium leading-[18px] " +
                      (count === 0 ? "text-ink-5" : "text-ink")
                    }
                  >
                    {c.name}
                  </span>
                  <span className="ml-auto text-[10px] leading-4 text-ink-3">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </aside>

      <div className="mt-6 lg:mt-0">
        {shown.length === 0 ? (
          <div className="rounded-[4px] border border-line bg-surface p-10 text-center">
            <p className="text-[16px] font-medium">Нічого не знайдено</p>
            <p className="mt-2 text-[12px] text-ink-3">
              Спробуйте змінити фільтри.
            </p>
            <button
              type="button"
              onClick={() => setSelected([])}
              className="mt-4 rounded-[3px] border border-edge px-4 py-2 text-[12px] font-medium text-ink-2 transition-colors hover:border-accent-deep"
            >
              Скинути фільтри
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {shown.map((p) => (
              <CardGrid key={p.slug} p={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {shown.map((p) => (
              <CardList key={p.slug} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
