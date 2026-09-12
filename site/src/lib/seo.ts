import type { Availability, PublicProduct } from "./types";

/* Спільні SEO-константи та генератори structured data (JSON-LD). */

export const SITE_URL = "https://ursvanguard.com";
export const SITE_NAME = "VANGUARD";
export const SITE_DESCRIPTION =
  "Каталог продукції VANGUARD: детектори БПЛА «КОЖАН», антени, РЕБ-системи та комплекти. Розробка й виробництво в Україні.";

// Профілі для Organization.sameAs
export const SOCIAL_LINKS = [
  "https://t.me/vanguard_urs",
  "https://www.instagram.com/vanguard_urs/",
  "https://www.tiktok.com/@vanguard_urs",
];

const abs = (path: string) => (path.startsWith("http") ? path : SITE_URL + path);

/** Availability DTO → значення schema.org. */
export function schemaAvailability(a: Availability): string {
  const base = "https://schema.org/";
  switch (a) {
    case "in_stock":
      return base + "InStock";
    case "production_3_5d":
    case "on_order":
      return base + "PreOrder";
    case "temporarily_unavailable":
      return base + "OutOfStock";
    case "check_with_manager":
      return base + "InStock";
  }
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "Ukrainian Radioelectronic Systems",
    url: SITE_URL,
    logo: abs("/images/brand/logo-full.png"),
    description: SITE_DESCRIPTION,
    slogan: "Технології, що працюють там, де це дійсно важливо",
    // Сфери експертизи — допомагають AI/пошуку правильно класифікувати сутність бренду
    // (розрізнити від інших «VANGUARD») і цитувати за темою.
    knowsAbout: [
      "виявлення БПЛА",
      "протидія БПЛА (антидрон)",
      "радіоелектронна боротьба (РЕБ)",
      "детектори дронів",
      "антени та підсилення сигналу",
    ],
    areaServed: { "@type": "Country", name: "Ukraine" },
    // TODO(власник): foundingDate — вказати реальну дату/рік заснування (ISO, напр. "2015").
    // Свідомо не додаємо навмання: «10+ років досвіду» на /about — це досвід, а не дата реєстрації.
    // sameAs: соцмережі; додати Wikidata та профіль Brave1, щойно з'являться стабільні URL.
    sameAs: SOCIAL_LINKS,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+380608403520",
      email: "vanguardltd25@gmail.com",
      areaServed: "UA",
      availableLanguage: ["uk"],
    },
  };
}

/**
 * Product JSON-LD. Ціну кладемо лише для товарів із точною (exact) ціною.
 *
 * `related` — сумісні/пов'язані продукти (назва + slug) для `isRelatedTo`; сторінка
 * передає їх, бо резолвить slug→продукт у себе (productLd не має доступу до каталогу).
 *
 * Свідомо НЕ додаємо `aggregateRating`/`review`: реальної системи оцінок ще немає
 * (див. types.ts — UI не показує зірок), а позивні рецензентів — під OPSEC
 * (docs/04-logic.md §22). Повернемося, коли буде справжня рейтингова система.
 */
export function productLd(
  p: PublicProduct,
  related: { name: string; slug: string }[] = [],
) {
  const url = `${SITE_URL}/products/${p.slug}`;
  const exactPrice = p.publicPrice.type === "exact" ? p.publicPrice.amount : undefined;
  const sku = p.configuration?.variants[0]?.sku;

  const offers: Record<string, unknown> = {
    "@type": "Offer",
    url,
    availability: schemaAvailability(p.availability),
    priceCurrency: "UAH",
    seller: { "@type": "Organization", name: SITE_NAME },
  };
  if (exactPrice != null) offers.price = String(exactPrice);

  // Специфікації → additionalProperty: LLM охоче витягують конкретні числа з одиницями.
  // keySpecs (вибране) першими, далі повні publicSpecifications; дублікати за label прибираємо.
  const seen = new Set<string>();
  const additionalProperty = [
    ...p.keySpecs,
    ...p.publicSpecifications.flatMap((g) => g.items),
  ]
    .filter((s) => !seen.has(s.label) && seen.add(s.label) !== undefined)
    .map((s) => ({ "@type": "PropertyValue", name: s.label, value: s.value }));

  const isRelatedTo = related.map((r) => ({
    "@type": "Product",
    name: r.name,
    url: `${SITE_URL}/products/${r.slug}`,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.shortDescription,
    category: p.category.name,
    brand: { "@type": "Brand", name: SITE_NAME },
    manufacturer: { "@type": "Organization", name: SITE_NAME },
    ...(sku ? { sku } : {}),
    ...(p.publicImages.length > 0 ? { image: p.publicImages.map((im) => abs(im.src)) } : {}),
    ...(additionalProperty.length > 0 ? { additionalProperty } : {}),
    ...(p.warrantyMonths > 0
      ? {
          warranty: {
            "@type": "WarrantyPromise",
            durationOfWarranty: {
              "@type": "QuantitativeValue",
              value: p.warrantyMonths,
              unitCode: "MON", // UN/CEFACT: місяць
            },
          },
        }
      : {}),
    ...(isRelatedTo.length > 0 ? { isRelatedTo } : {}),
    offers,
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

/**
 * FAQPage JSON-LD. `answer` — текст відповіді; допускається базовий HTML
 * (<a>, <p>, <br>, <b>, <ul>, <li>) для внутрішніх посилань. Питання й відповіді
 * мають бути реально видимі на сторінці (у нас — контент <details> у SSR-HTML).
 */
export function faqPageLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}
