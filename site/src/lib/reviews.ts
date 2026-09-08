import "server-only";
import { cache } from "react";
import { getSql } from "./db";
import type { ReviewWithProduct } from "./types";

/**
 * Лоадер збірної сторінки «Відгуки»: усі схвалені відгуки з усіх опублікованих
 * продуктів, зшиті з назвою продукту (для фільтра та переходу в каталог).
 * Сортування — від найновіших. `cache()` дедуплікує в межах рендера.
 */
export const getAllReviews = cache(async (): Promise<ReviewWithProduct[]> => {
  const sql = getSql();
  const revs = await sql`
    SELECT r.id, r.display_name, r.role_label, r.rating, r.body, r.use_case_tag,
           r.published_at, r.verified,
           p.slug AS product_slug, p.name AS product_name,
           p.short_name AS product_short_name, p.type_label AS product_type_label
    FROM reviews r
    JOIN products p ON p.id = r.product_id
    WHERE r.status = 'approved' AND p.is_published
    ORDER BY r.published_at DESC, r.id DESC`;
  if (revs.length === 0) return [];

  const media = await sql`
    SELECT rm.review_id, rm.media_type, rm.src, rm.poster
    FROM review_media rm
    JOIN reviews r ON r.id = rm.review_id
    JOIN products p ON p.id = r.product_id
    WHERE r.status = 'approved' AND p.is_published`;

  const mediaByReview = new Map<string, { type: "photo" | "video"; src: string; poster?: string }[]>();
  for (const m of media) {
    const key = String(m.review_id);
    const arr = mediaByReview.get(key) ?? [];
    arr.push({ type: m.media_type as "photo" | "video", src: m.src as string, poster: (m.poster as string) ?? undefined });
    mediaByReview.set(key, arr);
  }

  return revs.map((r) => ({
    displayName: r.display_name as string,
    roleLabel: (r.role_label as string) ?? undefined,
    rating: (r.rating as number) ?? undefined,
    text: r.body as string,
    useCaseTag: (r.use_case_tag as string) ?? undefined,
    publishedAt: r.published_at as string,
    verified: true as const,
    media: mediaByReview.get(String(r.id)) ?? [],
    productSlug: r.product_slug as string,
    productName: r.product_name as string,
    productShortName: (r.product_short_name as string) ?? undefined,
    productTypeLabel: (r.product_type_label as string) ?? undefined,
  }));
});
