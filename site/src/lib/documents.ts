import documentsJson from "@/data/documents.json";
import type { DocumentCategory, PublicDocument } from "./types";
import { getProduct } from "./catalog";

const documents = documentsJson as PublicDocument[];

/** Документ, збагачений назвою/типом продукту з каталогу — для рендера в UI. */
export interface DocumentView extends PublicDocument {
  productName: string;
  productTypeLabel: string;
}

function enrich(d: PublicDocument): DocumentView {
  const p = getProduct(d.productSlug);
  return {
    ...d,
    productName: p?.shortName ?? p?.name ?? d.productSlug,
    productTypeLabel: p?.typeLabel ?? "",
  };
}

const byDateDesc = (a: PublicDocument, b: PublicDocument) =>
  b.updatedAt.localeCompare(a.updatedAt);

export function getDocuments(): DocumentView[] {
  return documents.map(enrich);
}

export function getRecentDocuments(limit = 4): DocumentView[] {
  return getDocuments().sort(byDateDesc).slice(0, limit);
}

/** Кількість документів на кожну категорію + усього — для лічильників вкладок. */
export function getCategoryCounts(): Record<DocumentCategory | "all", number> {
  const counts: Record<DocumentCategory | "all", number> = {
    all: documents.length,
    instructions: 0,
    specifications: 0,
    certificates: 0,
    testing: 0,
    software: 0,
  };
  for (const d of documents) counts[d.category] += 1;
  return counts;
}

/** Продукти, для яких є документи — опції фільтра «Продукт». */
export function getDocumentProducts(): { slug: string; name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const d of documents) map.set(d.productSlug, (map.get(d.productSlug) ?? 0) + 1);
  return [...map.entries()].map(([slug, count]) => {
    const p = getProduct(slug);
    return { slug, name: p?.shortName ?? p?.name ?? slug, count };
  });
}

/** Зведення для панелі «Обраний продукт» — продукт із найбільшою к-стю документів. */
export interface FeaturedProduct {
  slug: string;
  name: string;
  typeLabel: string;
  image: string;
  docsCount: number;
  version: string; // остання версія серед його документів
  updatedAt: string; // остання дата оновлення
}

export function getFeaturedProduct(): FeaturedProduct | null {
  const ranked = getDocumentProducts().sort((a, b) => b.count - a.count);
  const top = ranked[0];
  if (!top) return null;
  const p = getProduct(top.slug);
  const docs = getDocuments()
    .filter((d) => d.productSlug === top.slug)
    .sort(byDateDesc);
  return {
    slug: top.slug,
    name: p?.shortName ?? p?.name ?? top.slug,
    typeLabel: p?.typeLabel ?? "",
    // фото витягнуте з .fig (демо — до реальних фото продуктів від власника)
    image: "/images/documentation/product-kozhan.png",
    docsCount: top.count,
    version: docs[0]?.version ?? "",
    updatedAt: docs[0]?.updatedAt ?? "",
  };
}
