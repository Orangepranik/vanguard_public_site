/**
 * Drizzle-схема БД VANGUARD (PostgreSQL).
 * Кожна таблиця/колонка змаплена на Public DTO з site/src/lib/types.ts —
 * БД віддає назовні саме форму цих типів (whitelist). Деталі: docs/11-backend-db.md.
 */
import { sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  bigint,
  integer,
  text,
  boolean,
  timestamp,
  date,
  jsonb,
  primaryKey,
  unique,
  index,
  check,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

/* ── Enum-типи (дзеркало union'ів із types.ts) ── */
export const availability = pgEnum("availability", [
  "in_stock",
  "production_3_5d",
  "on_order",
  "temporarily_unavailable",
  "check_with_manager",
]);
export const priceType = pgEnum("price_type", ["from", "exact", "on_request"]);
export const optionGroupType = pgEnum("option_group_type", ["single", "multi"]);
export const relationType = pgEnum("relation_type", [
  "works_with",
  "requires",
  "recommended_addon",
]);
export const documentType = pgEnum("document_type", ["pdf", "docx", "zip"]);
export const documentCategory = pgEnum("document_category", [
  "instructions",
  "specifications",
  "certificates",
  "testing",
  "software",
]);
export const contactChannel = pgEnum("contact_channel", [
  "call",
  "telegram",
  "signal",
  "whatsapp",
]);
export const reviewStatus = pgEnum("review_status", ["pending", "approved", "rejected"]);
export const requestStatus = pgEnum("request_status", ["new", "in_progress", "done", "spam"]);

const emptyText = sql`ARRAY[]::text[]`;

/* ── Каталог ── */
export const categories = pgTable("categories", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  slug: text("slug").notNull().unique(), // Category.slug
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0), // Category.order
});

export const products = pgTable(
  "products",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    slug: text("slug").notNull().unique(), // PublicProduct.slug
    name: text("name").notNull(),
    shortName: text("short_name"), // shortName
    typeLabel: text("type_label"), // typeLabel
    shortDescription: text("short_description").notNull(),
    categoryId: bigint("category_id", { mode: "number" })
      .notNull()
      .references(() => categories.id),
    cardTags: text("card_tags").array().notNull().default(emptyText),
    useCases: text("use_cases").array().notNull().default(emptyText),
    badges: text("badges").array().notNull().default(emptyText),
    packageContents: text("package_contents").array().notNull().default(emptyText),
    priceType: priceType("price_type").notNull(), // publicPrice.type
    priceAmount: integer("price_amount"), // грн; NULL для on_request
    currency: text("currency").notNull().default("UAH"),
    availability: availability("availability").notNull(),
    warrantyMonths: integer("warranty_months").notNull().default(12),
    defaultVariantId: bigint("default_variant_id", { mode: "number" }).references(
      (): AnyPgColumn => variants.id,
      { onDelete: "set null" },
    ),
    isPublished: boolean("is_published").notNull().default(false), // whitelist-видимість
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("products_category_idx").on(t.categoryId),
    index("products_published_idx").on(t.isPublished),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(), // ProductImage.src
    alt: text("alt").notNull().default(""),
    width: integer("width"),
    height: integer("height"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const productKeySpecs = pgTable(
  "product_key_specs",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("product_key_specs_product_idx").on(t.productId)],
);

export const specGroups = pgTable(
  "spec_groups",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    title: text("title").notNull(), // SpecGroup.group
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("spec_groups_product_idx").on(t.productId)],
);

export const specItems = pgTable(
  "spec_items",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    groupId: bigint("group_id", { mode: "number" })
      .notNull()
      .references(() => specGroups.id, { onDelete: "cascade" }),
    label: text("label").notNull(),
    value: text("value").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("spec_items_group_idx").on(t.groupId)],
);

/* ── Конфігуратор ── */
export const optionGroups = pgTable(
  "option_groups",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    extId: text("ext_id").notNull(), // OptionGroup.id («antenna»)
    label: text("label").notNull(),
    type: optionGroupType("type").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [unique("option_groups_ext_uq").on(t.productId, t.extId)],
);

export const options = pgTable(
  "options",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    optionGroupId: bigint("option_group_id", { mode: "number" })
      .notNull()
      .references(() => optionGroups.id, { onDelete: "cascade" }),
    extId: text("ext_id").notNull(), // ConfigOption.id («int»)
    label: text("label").notNull(),
    priceDelta: integer("price_delta").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [unique("options_ext_uq").on(t.optionGroupId, t.extId)],
);

export const variants = pgTable(
  "variants",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    extId: text("ext_id").notNull(), // Variant.id
    sku: text("sku").notNull().unique(),
    price: integer("price").notNull(),
    availability: availability("availability").notNull(),
  },
  (t) => [
    unique("variants_ext_uq").on(t.productId, t.extId),
    index("variants_product_idx").on(t.productId),
  ],
);

export const variantSelections = pgTable(
  "variant_selections",
  {
    variantId: bigint("variant_id", { mode: "number" })
      .notNull()
      .references(() => variants.id, { onDelete: "cascade" }),
    optionId: bigint("option_id", { mode: "number" })
      .notNull()
      .references(() => options.id),
  },
  (t) => [primaryKey({ columns: [t.variantId, t.optionId] })],
);

/* ── Звʼязки продуктів ── */
export const productRelations = pgTable(
  "product_relations",
  {
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    relatedProductId: bigint("related_product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.productId, t.relatedProductId] }),
    check("no_self_relation", sql`${t.productId} <> ${t.relatedProductId}`),
  ],
);

export const compatibilityLinks = pgTable(
  "compatibility_links",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    targetProductId: bigint("target_product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    relation: relationType("relation").notNull(),
    note: text("note"),
  },
  (t) => [unique("compat_uq").on(t.productId, t.targetProductId, t.relation)],
);

/* ── Документація ── */
export const documents = pgTable(
  "documents",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    extId: text("ext_id").notNull().unique(), // PublicDocument.id
    title: text("title").notNull(),
    type: documentType("type").notNull(),
    category: documentCategory("category").notNull(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }), // productSlug → FK
    version: text("version").notNull(),
    updatedAt: date("updated_at", { mode: "string" }).notNull(), // ISO-дата
    sizeBytes: bigint("size_bytes", { mode: "number" }).notNull(),
    url: text("url").notNull().default("#"),
    isPublished: boolean("is_published").notNull().default(true),
  },
  (t) => [
    index("documents_product_idx").on(t.productId),
    index("documents_category_idx").on(t.category),
  ],
);

/* ── Відгуки (майбутнє, OPSEC-модерація) ── */
export const reviews = pgTable(
  "reviews",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    productId: bigint("product_id", { mode: "number" })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    displayName: text("display_name").notNull(), // позивний/роль — НІКОЛИ ПІБ
    roleLabel: text("role_label"),
    rating: integer("rating"),
    body: text("body").notNull(), // PublicReview.text
    useCaseTag: text("use_case_tag"),
    publishedAt: text("published_at").notNull(), // точність місяць «2026-03»
    verified: boolean("verified").notNull().default(true),
    status: reviewStatus("status").notNull().default("pending"), // назовні лише approved
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("reviews_product_status_idx").on(t.productId, t.status),
    check("rating_range", sql`${t.rating} BETWEEN 1 AND 5`),
  ],
);

export const reviewMedia = pgTable("review_media", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  reviewId: bigint("review_id", { mode: "number" })
    .notNull()
    .references(() => reviews.id, { onDelete: "cascade" }),
  mediaType: text("media_type").notNull(), // 'photo' | 'video'
  src: text("src").notNull(),
  poster: text("poster"),
});

/* ── Заявки (PII, лише сервер) ── */
export const requests = pgTable(
  "requests",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    contactChannel: contactChannel("contact_channel").notNull(),
    organization: text("organization"),
    comment: text("comment"),
    sourcePage: text("source_page"),
    status: requestStatus("status").notNull().default("new"),
  },
  (t) => [
    index("requests_created_idx").on(t.createdAt),
    index("requests_status_idx").on(t.status),
  ],
);

export const requestItems = pgTable(
  "request_items",
  {
    id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
    requestId: bigint("request_id", { mode: "number" })
      .notNull()
      .references(() => requests.id, { onDelete: "cascade" }),
    productSlug: text("product_slug").notNull(), // slug: історична цілісність
    qty: integer("qty").notNull(),
    configuration: jsonb("configuration"), // Record<optionGroupId, optionId>
    sku: text("sku"),
    priceAtSubmit: integer("price_at_submit"),
  },
  (t) => [
    index("request_items_request_idx").on(t.requestId),
    check("qty_positive", sql`${t.qty} > 0`),
  ],
);
