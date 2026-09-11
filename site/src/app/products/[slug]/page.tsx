import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductGallery from "@/components/product/ProductGallery";
import ProductOrderPanel from "@/components/product/ProductOrderPanel";
import ProductReviews from "@/components/product/ProductReviews";
import JsonLd from "@/components/JsonLd";
import { IconChevronRight, IconDownload, IconHome } from "@/components/icons";
import { getProduct, getProducts } from "@/lib/catalog";
import { AVAILABILITY_LABELS } from "@/lib/types";
import { formatBytes } from "@/lib/format";
import { productLd, breadcrumbLd } from "@/lib/seo";

export const revalidate = 300; // ISR: фонове оновлення раз на 5 хв

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  const url = `/products/${slug}`;
  const title = `${product.name} — VANGUARD`;
  const img = product.publicImages[0];
  return {
    title,
    description: product.shortDescription,
    alternates: { canonical: url },
    openGraph: {
      url,
      title,
      description: product.shortDescription,
      ...(img ? { images: [{ url: img.src, alt: img.alt || product.name }] } : {}),
    },
    ...(img ? { twitter: { card: "summary_large_image", images: [img.src] } } : {}),
  };
}

const RELATION_LABEL: Record<string, string> = {
  works_with: "Працює з",
  requires: "Потребує",
  recommended_addon: "Рекомендований аксесуар",
};
const DOC_BG: Record<string, string> = { pdf: "bg-file-pdf", docx: "bg-file-docx", zip: "bg-file-zip" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-[18px] font-bold uppercase leading-tight text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const [product, all] = await Promise.all([getProduct(slug), getProducts()]);
  if (!product) notFound();

  const bySlug = new Map(all.map((p) => [p.slug, p]));
  const related = product.relatedSlugs.map((s) => bySlug.get(s)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <JsonLd data={productLd(product)} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Головна", path: "/" },
          { name: "Каталог", path: "/catalog" },
          { name: product.name, path: `/products/${product.slug}` },
        ])}
      />
      <SiteHeader active="Каталог" />
      <main className="mx-auto w-full max-w-[1536px] flex-1 px-4 pb-12 lg:px-[67px]">
        <nav aria-label="Хлібні крихти" className="mt-3 flex items-center gap-2 text-[10px] leading-[14px]">
          <IconHome className="size-3.5 text-ink-3" />
          <Link href="/" className="transition-colors hover:text-ink-2">Головна</Link>
          <IconChevronRight aria-hidden className="size-3.5 text-ink-3" />
          <Link href="/catalog" className="transition-colors hover:text-ink-2">Каталог</Link>
          <IconChevronRight aria-hidden className="size-3.5 text-ink-3" />
          <span aria-current="page" className="text-ink-2">{product.name}</span>
        </nav>

        {/* ── Верх: галерея + інфо/замовлення ── */}
        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
          {/* Галерея */}
          <ProductGallery images={product.publicImages} name={product.name} />

          {/* Інфо */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-[4px] border border-badge bg-badge px-2 py-0.5 text-[10px] uppercase tracking-wide text-ink-3">
                {product.category.name}
              </span>
              {product.badges.map((b) => (
                <span key={b} className="rounded-[4px] border border-chip-line px-2 py-0.5 text-[10px] text-ink-3">{b}</span>
              ))}
            </div>

            <h1 className="mt-3 font-display text-[26px] font-bold uppercase leading-tight text-ink lg:text-[30px]">
              {product.name}
            </h1>
            {product.typeLabel && <p className="mt-1 text-[13px] text-ink-4">{product.typeLabel}</p>}

            {product.cardTags && product.cardTags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {product.cardTags.map((t) => (
                  <span key={t} className="rounded-[4px] border border-chip-line px-2 py-1 text-[11px] text-ink-2">{t}</span>
                ))}
              </div>
            )}

            <p className="mt-4 text-[13px] leading-relaxed text-ink-3">{product.shortDescription}</p>

            {product.keySpecs.length > 0 && (
              <dl className="mt-5 grid gap-y-2 rounded-[10px] border border-line-3 bg-surface p-4 text-[13px]">
                {product.keySpecs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-4">
                    <dt className="text-ink-4">{s.label}</dt>
                    <dd className="text-right text-ink-2">{s.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="mt-5">
              <ProductOrderPanel
                slug={product.slug}
                name={product.name}
                configuration={product.configuration}
                publicPrice={product.publicPrice}
                availability={product.availability}
              />
            </div>
          </div>
        </div>

        {/* ── Деталі ── */}
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px] lg:items-start">
          <div className="min-w-0 space-y-10">
            {product.publicSpecifications.length > 0 && (
              <Section title="Характеристики">
                <div className="space-y-5">
                  {product.publicSpecifications.map((g) => (
                    <div key={g.group} className="overflow-hidden rounded-[10px] border border-line-3">
                      <div className="bg-surface px-4 py-2 text-[12px] font-semibold uppercase tracking-wide text-ink-2">{g.group}</div>
                      <dl className="divide-y divide-line-3">
                        {g.items.map((it) => (
                          <div key={it.label} className="flex justify-between gap-4 px-4 py-2.5 text-[13px]">
                            <dt className="text-ink-4">{it.label}</dt>
                            <dd className="text-right text-ink-2">{it.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {product.packageContents.length > 0 && (
              <Section title="Комплектація">
                <ul className="space-y-2">
                  {product.packageContents.map((c) => (
                    <li key={c} className="flex items-start gap-2.5 text-[13px] text-ink-2">
                      <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                      {c}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {product.documents.length > 0 && (
              <Section title="Документація">
                <ul className="divide-y divide-line-3 overflow-hidden rounded-[10px] border border-line-3">
                  {product.documents.map((d) => (
                    <li key={d.title} className="flex items-center gap-3 px-4 py-3">
                      <span className={`flex h-8 w-7 shrink-0 items-center justify-center rounded-[4px] text-[9px] font-bold text-white ${DOC_BG[d.type] ?? "bg-ink-5"}`}>
                        {d.type.toUpperCase()}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] text-ink-2">{d.title}</div>
                        <div className="text-[11px] text-ink-4">{d.type.toUpperCase()} • {formatBytes(d.sizeBytes)}</div>
                      </div>
                      <a href={d.url} title={`Завантажити: ${d.title}`} aria-label={`Завантажити ${d.title}`} className="flex size-9 items-center justify-center rounded-[6px] border border-line text-ink-3 transition-colors hover:border-accent hover:text-ink">
                        <IconDownload className="size-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {product.reviews.length > 0 && <ProductReviews reviews={product.reviews} />}
          </div>

          {/* Права колонка: сумісність + схожі */}
          <aside className="space-y-6">
            {product.compatibility.length > 0 && (
              <div className="rounded-[10px] border border-line-3 bg-surface p-4">
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Сумісність</h2>
                <ul className="mt-3 space-y-3">
                  {product.compatibility.map((c) => {
                    const t = bySlug.get(c.slug);
                    return (
                      <li key={c.slug + c.relation}>
                        <div className="text-[10px] uppercase tracking-wide text-ink-5">{RELATION_LABEL[c.relation] ?? c.relation}</div>
                        {t ? (
                          <Link href={`/products/${t.slug}`} className="text-[13px] text-ink-2 transition-colors hover:text-accent">
                            {t.shortName ?? t.name}
                          </Link>
                        ) : (
                          <span className="text-[13px] text-ink-2">{c.slug}</span>
                        )}
                        {c.note && <p className="text-[11px] leading-4 text-ink-4">{c.note}</p>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {related.length > 0 && (
              <div className="rounded-[10px] border border-line-3 bg-surface p-4">
                <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Схожі продукти</h2>
                <ul className="mt-3 space-y-2.5">
                  {related.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/products/${p.slug}`} className="group flex items-center gap-3 rounded-[8px] border border-line-3 bg-card p-2.5 transition-colors hover:border-accent-deep">
                        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-field text-[8px] text-ink-5">ФОТО</span>
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] text-ink-2">{p.shortName ?? p.name}</span>
                          <span className="block truncate text-[11px] text-ink-5">{p.typeLabel}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link href="/catalog" className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 transition-colors hover:text-ink">
              ← Назад до каталогу
            </Link>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
