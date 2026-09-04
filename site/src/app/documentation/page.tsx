import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DocumentationView from "@/components/documentation/DocumentationView";
import { IconChevronRight, IconHome } from "@/components/icons";
import {
  getCategoryCounts,
  getDocumentProducts,
  getDocuments,
  getFeaturedProduct,
  getRecentDocuments,
} from "@/lib/documents";

export const revalidate = 300; // ISR: фонове оновлення раз на 5 хв

export const metadata: Metadata = {
  title: "Документація — VANGUARD",
  description:
    "Інструкції, технічні характеристики, сертифікати та ПЗ для обладнання VANGUARD: детектори БПЛА, антени, РЕБ-системи.",
};

export default async function DocumentationPage() {
  const [documents, categoryCounts, productOptions, featured, recent] = await Promise.all([
    getDocuments(),
    getCategoryCounts(),
    getDocumentProducts(),
    getFeaturedProduct(),
    getRecentDocuments(2),
  ]);

  return (
    <>
      <SiteHeader active="Документація" />
      <main className="mx-auto w-full max-w-[1536px] flex-1 px-4 pb-4 lg:px-[67px]">
        <nav
          aria-label="Хлібні крихти"
          className="mt-3 flex items-center gap-2 text-[10px] leading-[14px]"
        >
          <IconHome className="size-3.5 text-ink-3" />
          <Link href="/" className="transition-colors hover:text-ink-2">
            Головна
          </Link>
          <IconChevronRight aria-hidden className="size-3.5 text-ink-3" />
          <span aria-current="page">Документація</span>
        </nav>

        {/* Hero: фото виробництва (з .fig) + затемнення ліворуч під заголовок */}
        <section className="relative mt-3 overflow-hidden rounded-[14px] border border-line-3">
          <Image
            src="/images/documentation/factory.png"
            alt="Виробництво радіоелектронних систем VANGUARD"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1000px"
            className="object-cover object-right"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-bg via-bg/90 to-bg/30"
          />
          <div className="relative max-w-[600px] px-6 py-4 lg:px-10 lg:py-5">
            <h1 className="font-display text-[26px] font-bold uppercase leading-tight text-ink lg:text-[32px]">
              Документація
            </h1>
            <p className="mt-2 max-w-[480px] text-[13px] leading-relaxed text-ink-3">
              Інструкції, технічні характеристики, сертифікати та ПЗ для обладнання
              VANGUARD — систем виявлення та протидії БПЛА.
            </p>
          </div>
        </section>

        <DocumentationView
          documents={documents}
          categoryCounts={categoryCounts}
          productOptions={productOptions}
          featured={featured}
          recent={recent}
        />
      </main>
      <SiteFooter />
    </>
  );
}
