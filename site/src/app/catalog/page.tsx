import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdvantagesStrip from "@/components/AdvantagesStrip";
import CatalogView from "@/components/catalog/CatalogView";
import { IconChevronRight, IconHome } from "@/components/icons";
import { getCategories, getProducts } from "@/lib/catalog";

export const revalidate = 300; // ISR: фонове оновлення раз на 5 хв

export const metadata: Metadata = {
  title: "Каталог продукції — VANGUARD",
  description:
    "Професійні рішення для виявлення та протидії БПЛА. Обладнання для будь-яких умов та задач.",
};

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

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
          title="Каталог продукції"
          description="Професійні рішення для виявлення та протидії БПЛА. Обладнання для будь-яких умов та задач."
        />
        <AdvantagesStrip />
      </main>
      <SiteFooter />
    </>
  );
}
