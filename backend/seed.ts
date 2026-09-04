/**
 * Сід БД демо-даними з site/src/data/*.json (через Drizzle, мапінг DTO → таблиці).
 * Ідемпотентний: TRUNCATE перед вставкою. Запуск: `npm run db:seed`.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as t from "./schema.ts";

try {
  process.loadEnvFile(".env");
} catch {
  /* .env може бути відсутнім — беремо з оточення */
}

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, "..", "site", "src", "data");
const read = (f: string) => JSON.parse(readFileSync(join(dataDir, f), "utf8"));

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL не задано");
const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema: t });

const categories = read("categories.json");
const products = read("products.json");
const documents = read("documents.json");

await db.execute(sql`TRUNCATE categories, requests RESTART IDENTITY CASCADE`);

// ── Категорії ──
const catId = new Map<string, number>();
for (const c of categories) {
  const [row] = await db
    .insert(t.categories)
    .values({ slug: c.slug, name: c.name, description: c.description ?? "", sortOrder: c.order ?? 0 })
    .returning({ id: t.categories.id });
  catId.set(c.slug, row.id);
}

// ── Продукти (+ дочірні) ──
const prodId = new Map<string, number>();
for (const p of products) {
  const categoryId = catId.get(p.category.slug);
  if (!categoryId) throw new Error(`Немає категорії "${p.category.slug}" для ${p.slug}`);
  const onRequest = p.publicPrice.type === "on_request";

  const [prod] = await db
    .insert(t.products)
    .values({
      slug: p.slug,
      name: p.name,
      shortName: p.shortName ?? null,
      typeLabel: p.typeLabel ?? null,
      shortDescription: p.shortDescription,
      categoryId,
      cardTags: p.cardTags ?? [],
      useCases: p.useCases ?? [],
      badges: p.badges ?? [],
      packageContents: p.packageContents ?? [],
      priceType: p.publicPrice.type,
      priceAmount: onRequest ? null : p.publicPrice.amount,
      currency: onRequest ? "UAH" : p.publicPrice.currency,
      availability: p.availability,
      warrantyMonths: p.warrantyMonths ?? 12,
      isPublished: true,
    })
    .returning({ id: t.products.id });
  prodId.set(p.slug, prod.id);

  const images = p.publicImages ?? [];
  for (let i = 0; i < images.length; i++) {
    await db.insert(t.productImages).values({
      productId: prod.id, url: images[i].src, alt: images[i].alt ?? "",
      width: images[i].width, height: images[i].height, sortOrder: i,
    });
  }

  const keySpecs = p.keySpecs ?? [];
  for (let i = 0; i < keySpecs.length; i++) {
    await db.insert(t.productKeySpecs).values({
      productId: prod.id, label: keySpecs[i].label, value: keySpecs[i].value, sortOrder: i,
    });
  }

  const specs = p.publicSpecifications ?? [];
  for (let gi = 0; gi < specs.length; gi++) {
    const [grp] = await db
      .insert(t.specGroups)
      .values({ productId: prod.id, title: specs[gi].group, sortOrder: gi })
      .returning({ id: t.specGroups.id });
    const items = specs[gi].items ?? [];
    for (let ii = 0; ii < items.length; ii++) {
      await db.insert(t.specItems).values({
        groupId: grp.id, label: items[ii].label, value: items[ii].value, sortOrder: ii,
      });
    }
  }

  if (p.configuration) {
    const optId = new Map<string, number>(); // `${groupExt}:${optExt}` → optionId
    const groups = p.configuration.optionGroups ?? [];
    for (let gi = 0; gi < groups.length; gi++) {
      const g = groups[gi];
      const [og] = await db
        .insert(t.optionGroups)
        .values({ productId: prod.id, extId: g.id, label: g.label, type: g.type, sortOrder: gi })
        .returning({ id: t.optionGroups.id });
      for (let oi = 0; oi < (g.options ?? []).length; oi++) {
        const o = g.options[oi];
        const [op] = await db
          .insert(t.options)
          .values({ optionGroupId: og.id, extId: o.id, label: o.label, priceDelta: o.priceDelta ?? 0, sortOrder: oi })
          .returning({ id: t.options.id });
        optId.set(`${g.id}:${o.id}`, op.id);
      }
    }

    const varId = new Map<string, number>(); // variantExt → variantId
    for (const v of p.configuration.variants ?? []) {
      const [vr] = await db
        .insert(t.variants)
        .values({ productId: prod.id, extId: v.id, sku: v.sku, price: v.price, availability: v.availability })
        .returning({ id: t.variants.id });
      varId.set(v.id, vr.id);
      for (const [gExt, oExt] of Object.entries(v.options ?? {})) {
        const oid = optId.get(`${gExt}:${oExt}`);
        if (!oid) throw new Error(`Немає опції ${gExt}:${oExt} у ${p.slug}`);
        await db.insert(t.variantSelections).values({ variantId: vr.id, optionId: oid });
      }
    }
    const defId = varId.get(p.configuration.defaultVariantId);
    if (defId) {
      await db.update(t.products).set({ defaultVariantId: defId }).where(sql`${t.products.id} = ${prod.id}`);
    }
  }

  for (const r of p.reviews ?? []) {
    const [rv] = await db
      .insert(t.reviews)
      .values({
        productId: prod.id, displayName: r.displayName, roleLabel: r.roleLabel ?? null,
        rating: r.rating ?? null, body: r.text, useCaseTag: r.useCaseTag ?? null,
        publishedAt: r.publishedAt, verified: r.verified ?? true, status: "approved",
      })
      .returning({ id: t.reviews.id });
    for (const m of r.media ?? []) {
      await db.insert(t.reviewMedia).values({ reviewId: rv.id, mediaType: m.type, src: m.src, poster: m.poster ?? null });
    }
  }
}

// ── Звʼязки та сумісність (після вставки всіх продуктів) ──
for (const p of products) {
  const pid = prodId.get(p.slug)!;
  for (const rel of p.relatedSlugs ?? []) {
    const rid = prodId.get(rel);
    if (rid && rid !== pid) {
      await db.insert(t.productRelations).values({ productId: pid, relatedProductId: rid }).onConflictDoNothing();
    }
  }
  for (const c of p.compatibility ?? []) {
    const tid = prodId.get(c.slug);
    if (tid) {
      await db.insert(t.compatibilityLinks)
        .values({ productId: pid, targetProductId: tid, relation: c.relation, note: c.note ?? null })
        .onConflictDoNothing();
    }
  }
}

// ── Документи ──
let docsInserted = 0;
for (const d of documents) {
  const pid = prodId.get(d.productSlug);
  if (!pid) {
    console.warn(`док ${d.id}: немає продукту "${d.productSlug}" — пропущено`);
    continue;
  }
  await db.insert(t.documents).values({
    extId: d.id, title: d.title, type: d.type, category: d.category, productId: pid,
    version: d.version, updatedAt: d.updatedAt, sizeBytes: d.sizeBytes, url: d.url ?? "#", isPublished: true,
  });
  docsInserted++;
}

const [summary] = await db.execute(sql`SELECT
  (SELECT count(*) FROM categories)          AS categories,
  (SELECT count(*) FROM products)            AS products,
  (SELECT count(*) FROM variants)            AS variants,
  (SELECT count(*) FROM variant_selections)  AS variant_selections,
  (SELECT count(*) FROM documents)           AS documents,
  (SELECT count(*) FROM reviews)             AS reviews`);
console.log("Сід завершено:", summary, `(документів вставлено: ${docsInserted})`);

await client.end();
