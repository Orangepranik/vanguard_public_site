import "server-only";
import { cache } from "react";
import { getSql } from "./db";
import type { DocumentCategory, DocumentView, FeaturedProduct } from "./types";

export type { DocumentView, FeaturedProduct } from "./types";

/**
 * Лоадери документації — читають із PostgreSQL (JOIN products для назви/типу продукту)
 * і проєктують у DTO. `cache()` дедуплікує запит у межах одного рендера; ISR — через `revalidate`.
 */

export const getDocuments = cache(async (): Promise<DocumentView[]> => {
  const sql = getSql();
  const rows = await sql`
    SELECT d.ext_id, d.title, d.type, d.category, d.version,
           to_char(d.updated_at, 'YYYY-MM-DD') AS updated_at, d.size_bytes, d.url,
           p.slug AS product_slug,
           COALESCE(p.short_name, p.name) AS product_name,
           COALESCE(p.type_label, '')     AS product_type_label
    FROM documents d JOIN products p ON p.id = d.product_id
    WHERE d.is_published AND p.is_published
    ORDER BY d.updated_at DESC`;
  return rows.map((r) => ({
    id: r.ext_id as string,
    title: r.title as string,
    type: r.type as DocumentView["type"],
    category: r.category as DocumentCategory,
    productSlug: r.product_slug as string,
    version: r.version as string,
    updatedAt: r.updated_at as string,
    sizeBytes: Number(r.size_bytes),
    url: r.url as string,
    productName: r.product_name as string,
    productTypeLabel: r.product_type_label as string,
  }));
});

export async function getRecentDocuments(limit = 4): Promise<DocumentView[]> {
  return (await getDocuments()).slice(0, limit); // вже відсортовано за датою DESC
}

/** Кількість документів на кожну категорію + усього — для лічильників вкладок. */
export async function getCategoryCounts(): Promise<Record<DocumentCategory | "all", number>> {
  const docs = await getDocuments();
  const counts: Record<DocumentCategory | "all", number> = {
    all: docs.length,
    instructions: 0,
    specifications: 0,
    certificates: 0,
    testing: 0,
    software: 0,
  };
  for (const d of docs) counts[d.category] += 1;
  return counts;
}

/** Продукти, для яких є документи — опції фільтра «Продукт». */
export async function getDocumentProducts(): Promise<{ slug: string; name: string; count: number }[]> {
  const docs = await getDocuments();
  const map = new Map<string, { name: string; count: number }>();
  for (const d of docs) {
    const e = map.get(d.productSlug);
    if (e) e.count += 1;
    else map.set(d.productSlug, { name: d.productName, count: 1 });
  }
  return [...map.entries()].map(([slug, v]) => ({ slug, name: v.name, count: v.count }));
}

/** Зведення для панелі «Обраний продукт» — продукт із найбільшою к-стю документів. */
export async function getFeaturedProduct(): Promise<FeaturedProduct | null> {
  const docs = await getDocuments();
  const ranked = (await getDocumentProducts()).sort((a, b) => b.count - a.count);
  const top = ranked[0];
  if (!top) return null;
  const theirs = docs.filter((d) => d.productSlug === top.slug); // відсортовані за датою DESC
  return {
    slug: top.slug,
    name: top.name,
    typeLabel: theirs[0]?.productTypeLabel ?? "",
    // фото витягнуте з .fig (демо — до реальних фото продуктів від власника)
    image: "/images/documentation/product-kozhan.png",
    docsCount: top.count,
    version: theirs[0]?.version ?? "",
    updatedAt: theirs[0]?.updatedAt ?? "",
  };
}
