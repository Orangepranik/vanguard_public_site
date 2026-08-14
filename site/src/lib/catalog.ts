import productsJson from "@/data/products.json";
import categoriesJson from "@/data/categories.json";
import type { Category, PublicProduct, Variant } from "./types";

const products = productsJson as unknown as PublicProduct[];
const categories = categoriesJson as Category[];

export function getCategories(): Category[] {
  return [...categories].sort((a, b) => a.order - b.order);
}

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getProducts(): PublicProduct[] {
  return products;
}

export function getProductsByCategory(categorySlug: string): PublicProduct[] {
  return products.filter((p) => p.category.slug === categorySlug);
}

export function getProduct(slug: string): PublicProduct | undefined {
  return products.find((p) => p.slug === slug);
}

export function getRelatedProducts(product: PublicProduct): PublicProduct[] {
  return product.relatedSlugs
    .map((slug) => getProduct(slug))
    .filter((p): p is PublicProduct => Boolean(p));
}

/** Знаходить допустимий варіант за повним вибором опцій (groupId -> optionId). */
export function resolveVariant(
  product: PublicProduct,
  selection: Record<string, string>,
): Variant | undefined {
  const cfg = product.configuration;
  if (!cfg) return undefined;
  return cfg.variants.find((v) =>
    Object.entries(v.options).every(([g, o]) => selection[g] === o),
  );
}
