import { getProducts } from "@/lib/catalog";

/**
 * GET /api/search — легкий індекс каталогу для миттєвого пошуку в топ-барі.
 * Клієнт вантажить його один раз при відкритті модалки й фільтрує локально.
 * Кешується (ISR revalidate=300) — БД не смикається на кожен пошук.
 */
export const revalidate = 300;

export async function GET() {
  const products = await getProducts();
  const index = products.map((p) => ({
    slug: p.slug,
    name: p.name,
    shortName: p.shortName ?? null,
    typeLabel: p.typeLabel ?? null,
    category: p.category.name,
    tags: p.cardTags ?? [],
  }));
  return Response.json({ products: index });
}
