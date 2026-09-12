import { getCategories, getProducts } from "@/lib/catalog";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/seo";

/**
 * /llms.txt — мапа контенту для LLM/AI-агентів (конвенція https://llmstxt.org).
 * Динамічний, як sitemap.ts: завжди містить актуальні категорії та продукти з БД.
 * Route Handler у Next 16 не кешується за замовчуванням; force-dynamic гарантує
 * рантайм-виконання (на збірці без DATABASE_URL колекції порожні — підтягне рантайм).
 */
export const dynamic = "force-dynamic";

const STATIC_PAGES: { path: string; title: string; summary: string }[] = [
  { path: "/catalog", title: "Каталог продукції", summary: "Детектори БПЛА «КОЖАН», засоби РЕБ, антени та готові комплекти." },
  { path: "/solutions", title: "Рішення", summary: "Підібрані конфігурації обладнання під сценарії застосування." },
  { path: "/reviews", title: "Відгуки", summary: "Досвід застосування обладнання (з OPSEC-модерацією)." },
  { path: "/warranty", title: "Гарантія", summary: "Умови гарантії — 12 місяців з дати передачі." },
  { path: "/faq", title: "Часті запитання", summary: "Замовлення, ціни, конфігурація, сумісність, гарантія, підтримка." },
  { path: "/about", title: "Про компанію", summary: "Розробка, виробництво та випробування радіоелектронних систем в Україні." },
  { path: "/contacts", title: "Контакти", summary: "Звʼязок і заявка: телефон, Telegram, форма." },
];

export async function GET() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  const lines: string[] = [
    `# ${SITE_NAME} — Ukrainian Radioelectronic Systems`,
    "",
    `> ${SITE_DESCRIPTION} Аудиторія: військові підрозділи, закупівельники, волонтерські фонди та дилери. ` +
      `Продаж — лише через заявку: менеджер узгоджує конфігурацію, оплату й доставку (онлайн-кошика та оплати на сайті немає).`,
    "",
    "## Основні сторінки",
    "",
    ...STATIC_PAGES.map((p) => `- [${p.title}](${SITE_URL}${p.path}): ${p.summary}`),
  ];

  if (categories.length > 0) {
    lines.push("", "## Категорії", "");
    for (const c of categories) {
      const desc = c.description ? `: ${c.description}` : "";
      lines.push(`- [${c.name}](${SITE_URL}/catalog?category=${c.slug})${desc}`);
    }
  }

  if (products.length > 0) {
    lines.push("", "## Продукти", "");
    for (const p of products) {
      const type = p.typeLabel ? ` — ${p.typeLabel}` : "";
      lines.push(`- [${p.name}](${SITE_URL}/products/${p.slug})${type}: ${p.shortDescription}`);
    }
  }

  lines.push(""); // завершальний перехід рядка

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
