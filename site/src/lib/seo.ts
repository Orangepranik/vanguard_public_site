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

/** Product JSON-LD. Ціну кладемо лише для товарів із точною (exact) ціною. */
export function productLd(p: PublicProduct) {
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

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.shortDescription,
    category: p.category.name,
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(sku ? { sku } : {}),
    ...(p.publicImages.length > 0 ? { image: p.publicImages.map((im) => abs(im.src)) } : {}),
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
