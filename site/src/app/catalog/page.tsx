import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdvantagesStrip from "@/components/AdvantagesStrip";
import CatalogView from "@/components/catalog/CatalogView";
import { IconChevronRight, IconHome } from "@/components/icons";
import { getCategories, getProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Каталог продукції — VANGUARD",
  description:
    "Детектори БПЛА «КОЖАН», засоби РЕБ («КРАКЕН», «ГІДРА 2U», «ДЕЛЬФІН», «ДОКАТКА»), антени та комплекти. Розробка й виробництво в Україні. Продаж — через заявку.",
  alternates: { canonical: "/catalog" },
};

// Front-load-абзац для каталогу (пропозиція, немає в макеті). Усі факти — з уже
// опублікованого: розрізнення детектор/РЕБ (FAQ), назви продуктів, походження (about),
// модель продажу й гарантія. Без вигаданих цифр і суперлативів. Власник може уточнити.
const CATALOG_INTRO =
  "Детектори «КОЖАН» виявляють БПЛА та канали звʼязку й попереджають оператора; " +
  "засоби РЕБ («КРАКЕН», «ГІДРА 2U», «ДЕЛЬФІН», «ДОКАТКА») придушують канали керування, " +
  "звʼязку та навігації. Обладнання VANGUARD розробляється й виробляється в Україні — " +
  "продаж через заявку, гарантія 12 місяців.";

type Params = { searchParams: Promise<{ category?: string }> };

export default async function CatalogPage({ searchParams }: Params) {
  const [{ category }, products, categories] = await Promise.all([
    searchParams,
    getProducts(),
    getCategories(),
  ]);
  const initialCategory =
    category && categories.some((c) => c.slug === category) ? category : undefined;

  return (
    <>
      <SiteHeader active="Каталог" />
      <main className="mx-auto w-full max-w-[1536px] flex-1 px-4 pb-3 lg:px-[67px]">
        <nav
          aria-label="Хлібні крихти"
          className="mt-[17px] flex items-center gap-2 text-[10px] leading-[14px]"
        >
          <IconHome className="size-3.5 text-ink-3" />
          <Link href="/" className="transition-colors hover:text-ink-2">
            Головна
          </Link>
          <IconChevronRight aria-hidden className="size-3.5 text-ink-3" />
          <span aria-current="page">Каталог</span>
        </nav>

        <CatalogView
          products={products}
          categories={categories}
          initialCategory={initialCategory}
          title="Каталог продукції"
          description="Професійні рішення для виявлення та протидії БПЛА. Обладнання для будь-яких умов та задач."
          intro={CATALOG_INTRO}
        />
        <AdvantagesStrip />
      </main>
      <SiteFooter />
    </>
  );
}
