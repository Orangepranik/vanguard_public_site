import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";
import { SITE_URL } from "@/lib/seo";

// Динамічний: завжди містить актуальний перелік продуктів із БД.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticPages: {
    path: string;
    priority: number;
    freq: MetadataRoute.Sitemap[number]["changeFrequency"];
  }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/catalog", priority: 0.9, freq: "daily" },
    { path: "/solutions", priority: 0.7, freq: "monthly" },
    { path: "/reviews", priority: 0.6, freq: "weekly" },
    { path: "/about", priority: 0.5, freq: "monthly" },
    { path: "/contacts", priority: 0.5, freq: "monthly" },
    { path: "/warranty", priority: 0.4, freq: "yearly" },
    { path: "/faq", priority: 0.4, freq: "monthly" },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.freq,
    priority: p.priority,
  }));

  const products = await getProducts();
  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticEntries, ...productEntries];
}
