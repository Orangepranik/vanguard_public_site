/**
 * Публічна проекція даних каталогу — за затвердженим DTO (docs/06-tech.md §28).
 * Whitelist-принцип: назовні існує лише те, що описано цими типами.
 */

export type Availability =
  | "in_stock"                // В наявності
  | "production_3_5d"         // Виробництво 3–5 днів
  | "on_order"                // Під замовлення
  | "temporarily_unavailable" // Тимчасово недоступний
  | "check_with_manager";     // Уточнюйте наявність

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  in_stock: "В наявності",
  production_3_5d: "Виробництво 3–5 днів",
  on_order: "Під замовлення",
  temporarily_unavailable: "Тимчасово недоступний",
  check_with_manager: "Уточнюйте наявність",
};

export interface Category {
  slug: string;
  name: string;
  description: string;
  order: number;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface SpecGroup {
  group: string;
  items: SpecItem[];
}

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ConfigOption {
  id: string;
  label: string;       // людська назва: «Виносні антени», не «EXT»
  priceDelta: number;  // грн, відносно базового варіанта
}

export interface OptionGroup {
  id: string;
  label: string;
  type: "single" | "multi";
  options: ConfigOption[];
}

export interface Variant {
  id: string;
  options: Record<string, string>; // groupId -> optionId (лише допустимі комбінації)
  sku: string;
  price: number;
  availability: Availability;
}

export interface Configuration {
  optionGroups: OptionGroup[];
  variants: Variant[];
  defaultVariantId: string;
}

export type PublicPrice =
  | { type: "from"; amount: number; currency: "UAH" }
  | { type: "exact"; amount: number; currency: "UAH" }
  | { type: "on_request" };

export interface CompatibilityLink {
  slug: string;
  relation: "works_with" | "requires" | "recommended_addon";
  note?: string;
}

/** Відгуки живуть у контент-шарі, НЕ в ERP; правила модерації — docs/04-logic.md §22 */
export interface PublicReview {
  displayName: string;   // позивний або роль, ніколи ПІБ
  roleLabel?: string;
  rating?: number;       // UI не показує зірок, поки немає реальної рейтингової системи
  text: string;
  media?: { type: "photo" | "video"; src: string; poster?: string }[];
  useCaseTag?: string;
  publishedAt: string;   // точність — місяць, напр. "2026-03"
  verified: true;
}

export interface DocumentLink {
  title: string;
  type: string; // "pdf"
  url: string;
  sizeBytes: number;
}

export interface PublicProduct {
  slug: string;
  name: string;
  /** Коротка назва для картки каталогу («КОЖАН») — Figma catalog_page */
  shortName?: string;
  /** Підпис типу під назвою на картці («Детектор БПЛА») */
  typeLabel?: string;
  /** Теги-чипи на картці («1G», «до 10 км») */
  cardTags?: string[];
  shortDescription: string;
  category: { slug: string; name: string };
  useCases: string[]; // infantry | vehicle | stationary | mobile-group | unit | special
  badges: string[];
  publicImages: ProductImage[];
  keySpecs: SpecItem[];
  publicSpecifications: SpecGroup[];
  configuration?: Configuration;
  publicPrice: PublicPrice;
  availability: Availability;
  documents: DocumentLink[];
  packageContents: string[];
  warrantyMonths: number;
  relatedSlugs: string[];
  compatibility: CompatibilityLink[];
  reviews: PublicReview[];
}

/* ---------- Бібліотека документації (сторінка «Документація», Figma) ---------- */

export type DocumentType = "pdf" | "docx" | "zip";

export type DocumentCategory =
  | "instructions"    // Інструкції
  | "specifications"  // Технічні характеристики
  | "certificates"    // Сертифікати
  | "testing"         // Випробування
  | "software";       // ПЗ та оновлення

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  instructions: "Інструкції",
  specifications: "Технічні характеристики",
  certificates: "Сертифікати",
  testing: "Випробування",
  software: "ПЗ та оновлення",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  pdf: "PDF",
  docx: "DOCX",
  zip: "ZIP",
};

/** Один документ публічної бібліотеки. Файл (`url`) додає власник пізніше;
 *  `productSlug` зшивається з каталогом для назви/типу продукту. */
export interface PublicDocument {
  id: string;
  title: string;
  type: DocumentType;
  category: DocumentCategory;
  productSlug: string;
  version: string;     // напр. "v2.1"
  updatedAt: string;   // ISO-дата, напр. "2026-08-12"
  sizeBytes: number;
  url: string;
}

/* ---------- Заявка (docs/04-logic.md §21) ---------- */

export type ContactChannel = "call" | "telegram" | "signal" | "whatsapp";

export interface RequestItem {
  slug: string;
  qty: number;
  configuration?: Record<string, string>; // groupId -> optionId
  sku?: string;
  priceAtSubmit?: number;
}

export interface RequestPayload {
  items: RequestItem[];
  name: string;
  phone: string;
  contactChannel: ContactChannel;
  organization?: string; // свідомо необов'язкове (OPSEC)
  comment?: string;
  sourcePage?: string;
}
