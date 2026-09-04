import "server-only";
import { cache } from "react";
import { getSql } from "./db";
import type {
  Availability,
  Category,
  Configuration,
  DocumentLink,
  ProductImage,
  PublicPrice,
  PublicProduct,
  PublicReview,
  Variant,
} from "./types";

/**
 * Лоадери каталогу — читають із PostgreSQL і проєктують у Public DTO (types.ts).
 * `cache()` (React) дедуплікує запити в межах одного рендера; ISR — через `revalidate` на сторінках.
 */

type Row = Record<string, unknown>;

function groupBy(rows: Row[], key: string): Map<string, Row[]> {
  const m = new Map<string, Row[]>();
  for (const r of rows) {
    const k = String(r[key]);
    const arr = m.get(k);
    if (arr) arr.push(r);
    else m.set(k, [r]);
  }
  return m;
}

function toPrice(p: Row): PublicPrice {
  if (p.price_type === "on_request") return { type: "on_request" };
  return { type: p.price_type as "from" | "exact", amount: p.price_amount as number, currency: "UAH" };
}

const toImage = (im: Row): ProductImage => ({
  src: im.url as string,
  alt: (im.alt as string) ?? "",
  width: (im.width as number) ?? 0,
  height: (im.height as number) ?? 0,
});

// ── Категорії ──
export const getCategories = cache(async (): Promise<Category[]> => {
  const sql = getSql();
  const rows = await sql`
    SELECT slug, name, description, sort_order
    FROM categories ORDER BY sort_order`;
  return rows.map((r) => ({ slug: r.slug, name: r.name, description: r.description, order: r.sort_order }));
});

export async function getCategory(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

// ── Список продуктів (картковий рівень; важкі колекції — лише в getProduct) ──
export const getProducts = cache(async (): Promise<PublicProduct[]> => {
  const sql = getSql();
  const prods = await sql`
    SELECT p.slug, p.name, p.short_name, p.type_label, p.short_description,
           p.card_tags, p.use_cases, p.badges, p.package_contents,
           p.price_type, p.price_amount, p.currency, p.availability, p.warranty_months,
           c.slug AS category_slug, c.name AS category_name
    FROM products p JOIN categories c ON c.id = p.category_id
    WHERE p.is_published
    ORDER BY p.name`;
  if (prods.length === 0) return [];
  const images = await sql`
    SELECT im.url, im.alt, im.width, im.height, p.slug AS pslug
    FROM product_images im JOIN products p ON p.id = im.product_id
    WHERE p.is_published
    ORDER BY im.sort_order`;
  const imgBySlug = groupBy(images, "pslug");
  return prods.map((p) => card(p, imgBySlug.get(p.slug as string) ?? []));
});

function card(p: Row, images: Row[]): PublicProduct {
  return {
    slug: p.slug as string,
    name: p.name as string,
    shortName: (p.short_name as string) ?? undefined,
    typeLabel: (p.type_label as string) ?? undefined,
    cardTags: (p.card_tags as string[]) ?? [],
    shortDescription: p.short_description as string,
    category: { slug: p.category_slug as string, name: p.category_name as string },
    useCases: (p.use_cases as string[]) ?? [],
    badges: (p.badges as string[]) ?? [],
    publicImages: images.map(toImage),
    keySpecs: [],
    publicSpecifications: [],
    publicPrice: toPrice(p),
    availability: p.availability as Availability,
    documents: [],
    packageContents: (p.package_contents as string[]) ?? [],
    warrantyMonths: p.warranty_months as number,
    relatedSlugs: [],
    compatibility: [],
    reviews: [],
  };
}

export async function getProductsByCategory(categorySlug: string): Promise<PublicProduct[]> {
  return (await getProducts()).filter((p) => p.category.slug === categorySlug);
}

// ── Продукт: повний DTO (усі дочірні сутності) ──
export const getProduct = cache(async (slug: string): Promise<PublicProduct | undefined> => {
  const sql = getSql();
  const [p] = await sql`
    SELECT p.slug, p.name, p.short_name, p.type_label, p.short_description,
           p.card_tags, p.use_cases, p.badges, p.package_contents,
           p.price_type, p.price_amount, p.currency, p.availability, p.warranty_months,
           p.default_variant_id, c.slug AS category_slug, c.name AS category_name
    FROM products p JOIN categories c ON c.id = p.category_id
    WHERE p.slug = ${slug} AND p.is_published`;
  if (!p) return undefined;

  const [images, keys, sgroups, sitems, ogroups, opts, vars, vsel, docs, revs, rmedia, rels, compat] =
    await Promise.all([
      sql`SELECT im.url, im.alt, im.width, im.height FROM product_images im JOIN products p ON p.id=im.product_id WHERE p.slug=${slug} ORDER BY im.sort_order`,
      sql`SELECT k.label, k.value FROM product_key_specs k JOIN products p ON p.id=k.product_id WHERE p.slug=${slug} ORDER BY k.sort_order`,
      sql`SELECT sg.id, sg.title FROM spec_groups sg JOIN products p ON p.id=sg.product_id WHERE p.slug=${slug} ORDER BY sg.sort_order`,
      sql`SELECT si.group_id, si.label, si.value FROM spec_items si JOIN spec_groups sg ON sg.id=si.group_id JOIN products p ON p.id=sg.product_id WHERE p.slug=${slug} ORDER BY si.sort_order`,
      sql`SELECT og.id, og.ext_id, og.label, og.type FROM option_groups og JOIN products p ON p.id=og.product_id WHERE p.slug=${slug} ORDER BY og.sort_order`,
      sql`SELECT o.option_group_id, o.ext_id, o.label, o.price_delta FROM options o JOIN option_groups og ON og.id=o.option_group_id JOIN products p ON p.id=og.product_id WHERE p.slug=${slug} ORDER BY o.sort_order`,
      sql`SELECT v.id, v.ext_id, v.sku, v.price, v.availability FROM variants v JOIN products p ON p.id=v.product_id WHERE p.slug=${slug}`,
      sql`SELECT vs.variant_id, o.ext_id AS option_ext, og.ext_id AS group_ext FROM variant_selections vs JOIN variants v ON v.id=vs.variant_id JOIN products p ON p.id=v.product_id JOIN options o ON o.id=vs.option_id JOIN option_groups og ON og.id=o.option_group_id WHERE p.slug=${slug}`,
      sql`SELECT d.title, d.type, d.url, d.size_bytes FROM documents d JOIN products p ON p.id=d.product_id WHERE p.slug=${slug} AND d.is_published`,
      sql`SELECT r.id, r.display_name, r.role_label, r.rating, r.body, r.use_case_tag, r.published_at, r.verified FROM reviews r JOIN products p ON p.id=r.product_id WHERE p.slug=${slug} AND r.status='approved' ORDER BY r.published_at DESC`,
      sql`SELECT rm.review_id, rm.media_type, rm.src, rm.poster FROM review_media rm JOIN reviews r ON r.id=rm.review_id JOIN products p ON p.id=r.product_id WHERE p.slug=${slug}`,
      sql`SELECT p2.slug FROM product_relations pr JOIN products p ON p.id=pr.product_id JOIN products p2 ON p2.id=pr.related_product_id WHERE p.slug=${slug}`,
      sql`SELECT cl.relation, cl.note, p2.slug AS target_slug FROM compatibility_links cl JOIN products p ON p.id=cl.product_id JOIN products p2 ON p2.id=cl.target_product_id WHERE p.slug=${slug}`,
    ]);

  const itemsByGroup = groupBy(sitems, "group_id");
  const optsByGroup = groupBy(opts, "option_group_id");
  const selByVar = groupBy(vsel, "variant_id");
  const mediaByReview = groupBy(rmedia, "review_id");

  let configuration: Configuration | undefined;
  if (ogroups.length > 0) {
    const optionGroups = ogroups.map((g) => ({
      id: g.ext_id as string,
      label: g.label as string,
      type: g.type as "single" | "multi",
      options: (optsByGroup.get(String(g.id)) ?? []).map((o) => ({
        id: o.ext_id as string,
        label: o.label as string,
        priceDelta: o.price_delta as number,
      })),
    }));
    const varExtById = new Map(vars.map((v) => [String(v.id), v.ext_id as string]));
    const variants: Variant[] = vars.map((v) => ({
      id: v.ext_id as string,
      options: Object.fromEntries((selByVar.get(String(v.id)) ?? []).map((s) => [s.group_ext, s.option_ext])) as Record<string, string>,
      sku: v.sku as string,
      price: v.price as number,
      availability: v.availability as Availability,
    }));
    const defaultVariantId =
      (p.default_variant_id != null ? varExtById.get(String(p.default_variant_id)) : undefined) ??
      variants[0]?.id ??
      "";
    configuration = { optionGroups, variants, defaultVariantId };
  }

  const documents: DocumentLink[] = docs.map((d) => ({
    title: d.title as string, type: d.type as string, url: d.url as string, sizeBytes: Number(d.size_bytes),
  }));

  const reviews: PublicReview[] = revs.map((r) => ({
    displayName: r.display_name as string,
    roleLabel: (r.role_label as string) ?? undefined,
    rating: (r.rating as number) ?? undefined,
    text: r.body as string,
    useCaseTag: (r.use_case_tag as string) ?? undefined,
    publishedAt: r.published_at as string,
    verified: true,
    media: (mediaByReview.get(String(r.id)) ?? []).map((m) => ({
      type: m.media_type as "photo" | "video", src: m.src as string, poster: (m.poster as string) ?? undefined,
    })),
  }));

  return {
    slug: p.slug as string,
    name: p.name as string,
    shortName: (p.short_name as string) ?? undefined,
    typeLabel: (p.type_label as string) ?? undefined,
    cardTags: (p.card_tags as string[]) ?? [],
    shortDescription: p.short_description as string,
    category: { slug: p.category_slug as string, name: p.category_name as string },
    useCases: (p.use_cases as string[]) ?? [],
    badges: (p.badges as string[]) ?? [],
    publicImages: images.map(toImage),
    keySpecs: keys.map((k) => ({ label: k.label as string, value: k.value as string })),
    publicSpecifications: sgroups.map((g) => ({
      group: g.title as string,
      items: (itemsByGroup.get(String(g.id)) ?? []).map((i) => ({ label: i.label as string, value: i.value as string })),
    })),
    configuration,
    publicPrice: toPrice(p),
    availability: p.availability as Availability,
    documents,
    packageContents: (p.package_contents as string[]) ?? [],
    warrantyMonths: p.warranty_months as number,
    relatedSlugs: rels.map((r) => r.slug as string),
    compatibility: compat.map((c) => ({
      slug: c.target_slug as string,
      relation: c.relation as "works_with" | "requires" | "recommended_addon",
      note: (c.note as string) ?? undefined,
    })),
    reviews,
  };
});

export async function getRelatedProducts(product: PublicProduct): Promise<PublicProduct[]> {
  if (product.relatedSlugs.length === 0) return [];
  const all = await getProducts();
  return product.relatedSlugs
    .map((s) => all.find((p) => p.slug === s))
    .filter((p): p is PublicProduct => Boolean(p));
}

/** Знаходить допустимий варіант за повним вибором опцій (groupId -> optionId). Чиста функція. */
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
