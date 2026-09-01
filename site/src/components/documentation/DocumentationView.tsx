"use client";

import { useMemo, useState } from "react";
import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { DocumentCategory, DocumentType } from "@/lib/types";
import { DOCUMENT_CATEGORY_LABELS, DOCUMENT_TYPE_LABELS } from "@/lib/types";
import type { DocumentView, FeaturedProduct } from "@/lib/documents";
import { documentsPlural, formatBytes, formatDate } from "@/lib/format";
import {
  IconArrowRight,
  IconCertificate,
  IconCheck,
  IconChevronDown,
  IconDoc,
  IconDownload,
  IconEye,
  IconFlask,
  IconFolder,
  IconReset,
  IconSoftware,
  IconSpecs,
} from "@/components/icons";

type TabKey = DocumentCategory | "all";
type SortKey = "newest" | "oldest" | "name";
type IconType = (p: { className?: string }) => ReactElement;

const TABS: { key: TabKey; label: string; Icon: IconType }[] = [
  { key: "all", label: "Усі документи", Icon: IconFolder },
  { key: "instructions", label: "Інструкції", Icon: IconDoc },
  { key: "specifications", label: "Технічні характеристики", Icon: IconSpecs },
  { key: "certificates", label: "Сертифікати", Icon: IconCertificate },
  { key: "testing", label: "Випробування", Icon: IconFlask },
  { key: "software", label: "ПЗ та оновлення", Icon: IconSoftware },
];

const TYPE_ORDER: DocumentType[] = ["pdf", "docx", "zip"];

// Кольори бейджів типів — з макета (PDF червоний, DOCX синій, ZIP помаранчевий).
const typeBg: Record<DocumentType, string> = {
  pdf: "bg-file-pdf",
  docx: "bg-file-docx",
  zip: "bg-file-zip",
};

function FileBadge({ type, className = "" }: { type: DocumentType; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-[4px] font-bold text-white ${typeBg[type]} ${className}`}
    >
      <span className="text-[9px] leading-none">{DOCUMENT_TYPE_LABELS[type]}</span>
    </span>
  );
}

function Check({
  checked,
  onChange,
  label,
  count,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  count?: number;
}) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-2 py-1 text-[13px] text-ink-2">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onChange} />
      <span
        className={
          "flex size-[15px] shrink-0 items-center justify-center rounded-[3px] border transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-1 peer-focus-visible:outline-accent " +
          (checked ? "border-accent bg-accent" : "border-edge")
        }
      >
        {checked && <IconCheck className="size-2.5 text-white" />}
      </span>
      <span className="flex-1">{label}</span>
      {count != null && <span className="text-[11px] text-ink-5">{count}</span>}
    </label>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-line pt-3">
      <h3 className="mb-1.5 text-[13px] font-medium text-ink-2">{title}</h3>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export default function DocumentationView({
  documents,
  categoryCounts,
  productOptions,
  featured,
  recent,
}: {
  documents: DocumentView[];
  categoryCounts: Record<TabKey, number>;
  productOptions: { slug: string; name: string; count: number }[];
  featured: FeaturedProduct | null;
  recent: DocumentView[];
}) {
  const [tab, setTab] = useState<TabKey>("all");
  const [types, setTypes] = useState<Set<DocumentType>>(new Set());
  const [products, setProducts] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const typeCounts = useMemo(() => {
    const c: Record<DocumentType, number> = { pdf: 0, docx: 0, zip: 0 };
    for (const d of documents) c[d.type] += 1;
    return c;
  }, [documents]);

  const filtered = useMemo(() => {
    let list = documents;
    if (tab !== "all") list = list.filter((d) => d.category === tab);
    if (types.size) list = list.filter((d) => types.has(d.type));
    if (products.size) list = list.filter((d) => products.has(d.productSlug));
    const sorted = [...list];
    if (sort === "newest") sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    else if (sort === "oldest") sorted.sort((a, b) => a.updatedAt.localeCompare(b.updatedAt));
    else sorted.sort((a, b) => a.title.localeCompare(b.title, "uk"));
    return sorted;
  }, [documents, tab, types, products, sort]);

  const toggle = <T,>(set: Set<T>, val: T): Set<T> => {
    const next = new Set(set);
    if (next.has(val)) next.delete(val);
    else next.add(val);
    return next;
  };
  const hasFilters = types.size > 0 || products.size > 0;
  const resetFilters = () => {
    setTypes(new Set());
    setProducts(new Set());
  };

  return (
    <>
      {/* Вкладки категорій */}
      <div className="mt-6 border-y border-line-3 bg-panel-2">
        <div role="tablist" aria-label="Категорії документів" className="flex overflow-x-auto">
          {TABS.map(({ key, label, Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(key)}
                className={
                  "relative flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-3.5 text-[14px] font-medium transition-colors " +
                  (active ? "text-tab" : "text-ink-2 hover:text-ink")
                }
              >
                <Icon className="size-[18px]" />
                {label}
                <span className={"text-[11px] " + (active ? "text-tab/70" : "text-ink-5")}>
                  {categoryCounts[key]}
                </span>
                {active && <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-tab" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Кнопка фільтрів для мобільних */}
      <button
        type="button"
        onClick={() => setFiltersOpen((o) => !o)}
        aria-expanded={filtersOpen}
        className="mt-5 flex items-center gap-2 rounded-[6px] border border-line px-3 py-2 text-[13px] text-ink-2 lg:hidden"
      >
        <IconReset className="size-4" />
        {filtersOpen ? "Сховати фільтри" : "Фільтри"}
        {hasFilters && <span className="rounded-full bg-accent px-1.5 text-[10px] text-white">{types.size + products.size}</span>}
      </button>

      {/* Контент: фільтри · таблиця · праві панелі */}
      <div className="mt-5 flex flex-col gap-6 lg:grid lg:grid-cols-[240px_1fr] lg:items-start xl:grid-cols-[240px_1fr_300px]">
        {/* Сайдбар фільтрів */}
        <aside className={(filtersOpen ? "flex" : "hidden") + " flex-col gap-4 lg:flex xl:row-start-1"}>
          <div className="rounded-[10px] border border-line-3 bg-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Фільтри</h2>
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex items-center gap-1 text-[11px] text-ink-4 transition-colors hover:text-ink"
                >
                  Скинути все
                  <IconReset className="size-3.5" />
                </button>
              )}
            </div>

            <div className="mt-3 space-y-3">
              <FilterGroup title="Тип документа">
                {TYPE_ORDER.map((t) => (
                  <Check
                    key={t}
                    checked={types.has(t)}
                    onChange={() => setTypes((s) => toggle(s, t))}
                    label={DOCUMENT_TYPE_LABELS[t]}
                    count={typeCounts[t]}
                  />
                ))}
              </FilterGroup>

              <FilterGroup title="Продукт">
                {productOptions.map((p) => (
                  <Check
                    key={p.slug}
                    checked={products.has(p.slug)}
                    onChange={() => setProducts((s) => toggle(s, p.slug))}
                    label={p.name}
                    count={p.count}
                  />
                ))}
              </FilterGroup>
            </div>
          </div>

          <div className="rounded-[10px] border border-line-3 bg-help p-4">
            <h3 className="text-[13px] font-semibold text-ink">Не знайшли потрібний документ?</h3>
            <p className="mt-1.5 text-[11px] leading-4 text-ink-3">
              Запросіть документацію або зв&apos;яжіться з технічною підтримкою.
            </p>
            <Link
              href="#request"
              className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-tab transition-opacity hover:opacity-80"
            >
              Запросити документацію
              <IconArrowRight className="size-4" />
            </Link>
          </div>
        </aside>

        {/* Таблиця документів */}
        <section className="min-w-0 xl:col-start-2 xl:row-start-1">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-[18px] font-bold uppercase leading-tight text-ink">
                {tab === "all" ? "Усі документи" : DOCUMENT_CATEGORY_LABELS[tab]}
              </h2>
              <p className="mt-0.5 text-[12px] text-ink-3">Знайдено {documentsPlural(filtered.length)}</p>
            </div>
            <label className="flex items-center gap-2 text-[12px] text-ink-3">
              Сортування:
              <span className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="appearance-none rounded-[6px] border border-line bg-inset py-1.5 pl-3 pr-8 text-[12px] text-ink focus:outline-none focus-visible:outline-2 focus-visible:outline-accent"
                  aria-label="Сортування документів"
                >
                  <option value="newest">Найновіші</option>
                  <option value="oldest">Найдавніші</option>
                  <option value="name">За назвою</option>
                </select>
                <IconChevronDown className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
              </span>
            </label>
          </div>

          <div className="mt-4 overflow-x-auto rounded-[10px] border border-line-3 bg-panel-2">
            <table className="w-full min-w-[620px] table-fixed border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-wide text-ink-4">
                  <th scope="col" className="px-4 py-3 font-medium">Документ</th>
                  <th scope="col" className="w-[130px] px-3 py-3 font-medium">Продукт</th>
                  <th scope="col" className="w-[64px] px-3 py-3 font-medium">Версія</th>
                  <th scope="col" className="w-[96px] px-3 py-3 font-medium">Оновлено</th>
                  <th scope="col" className="w-[70px] px-3 py-3 font-medium">Розмір</th>
                  <th scope="col" className="w-[164px] px-4 py-3 text-right font-medium">Дії</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => (
                  <tr key={d.id} className="border-b border-line-3 transition-colors last:border-0 hover:bg-row/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <FileBadge type={d.type} className="h-8 w-7 shrink-0" />
                        <div className="min-w-0">
                          <div className="truncate text-[13px] font-medium text-ink-2">{d.title}</div>
                          <div className="truncate whitespace-nowrap text-[11px] text-ink-4">
                            {DOCUMENT_TYPE_LABELS[d.type]} • {formatBytes(d.sizeBytes)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="whitespace-nowrap text-[13px] text-ink-2">{d.productName}</div>
                      <div className="whitespace-nowrap text-[11px] text-ink-4">{d.productTypeLabel}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-[13px] text-ink-3">{d.version}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-[13px] text-ink-3">{formatDate(d.updatedAt)}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-[13px] text-ink-3">{formatBytes(d.sizeBytes)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={d.url}
                          title="Файл буде додано власником"
                          className="inline-flex items-center gap-1.5 rounded-[6px] bg-help px-2.5 py-1.5 text-[12px] text-ink-2 transition-colors hover:text-ink"
                        >
                          <IconEye className="size-3.5" />
                          <span className="hidden sm:inline">Переглянути</span>
                        </a>
                        <a
                          href={d.url}
                          title={`Завантажити: ${d.title}`}
                          aria-label={`Завантажити ${d.title}`}
                          className="inline-flex size-8 items-center justify-center rounded-[6px] border border-line text-ink-3 transition-colors hover:border-accent hover:text-ink"
                        >
                          <IconDownload className="size-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="flex flex-col items-center gap-3 px-4 py-14 text-center">
                <p className="text-[14px] text-ink-3">За обраними фільтрами документів не знайдено.</p>
                <button
                  type="button"
                  onClick={() => {
                    setTab("all");
                    resetFilters();
                  }}
                  className="rounded-[6px] border border-line px-3 py-1.5 text-[12px] text-ink-2 hover:border-accent hover:text-ink"
                >
                  Скинути фільтри
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Праві панелі */}
        <aside className="flex flex-col gap-4 lg:col-span-2 xl:col-span-1 xl:col-start-3 xl:row-start-1">
          {featured && (
            <div className="rounded-[10px] border border-line-3 bg-panel p-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Обраний продукт</h2>
              <div className="mt-3 flex gap-3">
                <div className="relative h-[70px] w-[92px] shrink-0 overflow-hidden rounded-[6px] bg-black/30">
                  <Image src={featured.image} alt={featured.name} fill sizes="92px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[15px] font-semibold text-ink">{featured.name}</div>
                  <div className="text-[12px] text-ink-3">{featured.typeLabel}</div>
                </div>
              </div>
              <dl className="mt-3 space-y-1.5 text-[12px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-4">Документів:</dt>
                  <dd className="text-ink-2">{featured.docsCount}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-4">Актуальна версія:</dt>
                  <dd className="text-ink-2">{featured.version}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-ink-4">Оновлено:</dt>
                  <dd className="text-ink-2">{formatDate(featured.updatedAt)}</dd>
                </div>
              </dl>
              <Link
                href={`/products/${featured.slug}`}
                className="mt-3 flex h-9 items-center justify-between rounded-[6px] border border-accent-deep px-3 text-[13px] text-ink transition-colors hover:bg-accent-deep/15"
              >
                Відкрити продукт
                <IconArrowRight className="size-4 text-tab" />
              </Link>
            </div>
          )}

          {recent.length > 0 && (
            <div className="rounded-[10px] border border-line-3 bg-panel p-4">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Останні оновлення</h2>
              <ul className="mt-3 space-y-3">
                {recent.map((d) => (
                  <li key={d.id} className="flex gap-3">
                    <FileBadge type={d.type} className="h-7 w-6 shrink-0" />
                    <div className="min-w-0">
                      <div className="truncate text-[12px] font-medium text-ink-2">{d.productName}</div>
                      <div className="truncate text-[11px] text-ink-4">{d.title}</div>
                      <div className="mt-0.5 text-[10px] text-ink-5">
                        {d.version} • {formatDate(d.updatedAt)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
