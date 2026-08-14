import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { IconChevronRight, IconHome } from "@/components/icons";
import { getProduct, getProducts } from "@/lib/catalog";
import { AVAILABILITY_LABELS } from "@/lib/types";
import { availabilityClass, formatPrice } from "@/lib/format";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — VANGUARD`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <>
      <SiteHeader active="Каталог" />
      <main className="mx-auto w-full max-w-[1536px] flex-1 px-4 pb-10 lg:px-[67px]">
        <nav
          aria-label="Хлібні крихти"
          className="mt-[17px] flex items-center gap-2 text-[10px] leading-[14px]"
        >
          <IconHome className="size-3.5 text-ink-3" />
          <Link href="/" className="transition-colors hover:text-ink-2">
            Головна
          </Link>
          <IconChevronRight aria-hidden className="size-3.5 text-ink-3" />
          <Link href="/catalog" className="transition-colors hover:text-ink-2">
            Каталог
          </Link>
          <IconChevronRight aria-hidden className="size-3.5 text-ink-3" />
          <span aria-current="page">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[55fr_45fr]">
          <div className="flex aspect-[4/3] items-center justify-center rounded-[4px] border border-line bg-field text-[12px] text-ink-5">
            Фото продукту
          </div>

          <div>
            <h1 className="text-[26px] font-semibold leading-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-[13px] leading-[19px] text-ink-3">
              {product.shortDescription}
            </p>

            <div className="mt-5 flex items-center gap-4">
              <span className="text-[24px] font-bold">
                {formatPrice(product.publicPrice)}
              </span>
              <span
                className={
                  "flex items-center gap-1.5 text-[12px] font-medium " +
                  availabilityClass(product.availability)
                }
              >
                <span aria-hidden className="size-1.5 rounded-full bg-current" />
                {AVAILABILITY_LABELS[product.availability]}
              </span>
            </div>

            <dl className="mt-5 grid gap-2 rounded-[4px] border border-line bg-surface p-4">
              {product.keySpecs.map((s) => (
                <div key={s.label} className="flex justify-between gap-4 text-[13px]">
                  <dt className="text-ink-3">{s.label}</dt>
                  <dd className="text-right">{s.value}</dd>
                </div>
              ))}
            </dl>

            <p className="mt-5 rounded-[4px] border border-dashed border-edge p-4 text-[12px] leading-[18px] text-ink-4">
              Повна сторінка продукту (галерея, конфігуратор, характеристики,
              відгуки, заявка) верстається за наступним Figma-макетом. Дані вже
              підключені з контент-шару.
            </p>

            <Link
              href="/catalog"
              className="mt-5 inline-flex rounded-[3px] border border-edge px-4 py-2.5 text-[13px] font-medium text-ink-2 transition-colors hover:border-accent-deep hover:text-ink"
            >
              ← Назад до каталогу
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
