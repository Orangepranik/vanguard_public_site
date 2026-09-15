import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdvantagesStrip from "@/components/AdvantagesStrip";
import {
  IconAntenna,
  IconArrowRight,
  IconJammer,
  IconKit,
  IconRadar,
} from "@/components/icons";
import type { ReactElement } from "react";

/* Головна — за брифом власника, стилізована пропозиція в наявній дизайн-мові
   (макета ще немає). Статичний контент, БД не потрібна.
   Hero — преміум банер, адаптивний під тему (світла/темна) — CSS-фон, без фото.
   Плавний перехід на /catalog — CSS-анімація входу сторінки каталогу (globals.css). */

export const metadata: Metadata = {
  title: "VANGUARD — радіоелектронні системи виявлення та протидії БПЛА",
  description:
    "VANGUARD — український розробник і виробник радіоелектронних систем для виявлення та протидії сучасним повітряним загрозам. Власна розробка, виробництво й підтримка.",
  alternates: { canonical: "/" },
};

const STATS: { value: string; label: string }[] = [
  { value: "Власне", label: "виробництво в Україні" },
  { value: "10+", label: "років досвіду розробки" },
  { value: "100+", label: "випробувань у реальних умовах" },
  { value: "Постійна", label: "технічна підтримка" },
];

const DIRECTIONS: { name: string; desc: string; Icon: (p: { className?: string }) => ReactElement }[] = [
  { name: "Детектори", desc: "Виявлення активності БПЛА та каналів звʼязку в кількох частотних діапазонах.", Icon: IconRadar },
  { name: "РЕБ-системи", desc: "Придушення каналів управління та відеопередачі безпілотників.", Icon: IconJammer },
  { name: "Антени", desc: "Розширення дальності та чутливості комплексів виявлення.", Icon: IconAntenna },
  { name: "Комплекти", desc: "Готові рішення під конкретну задачу й умови застосування.", Icon: IconKit },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader active="Головна" />
      <main className="flex-1">
        {/* ── Hero: преміум банер, адаптивний під тему (світла/темна) ── */}
        <section className="hero relative isolate overflow-hidden">
          {/* Фонові шари (кольори — зі змінних теми у globals.css) */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {/* базовий градієнт + віньєтка */}
            <div className="absolute inset-0" style={{ background: "var(--hero-base)" }} />
            {/* акцентні глоу */}
            <div
              className="absolute left-1/2 top-[40%] size-[860px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{ background: "radial-gradient(circle, var(--hero-glow), transparent 60%)" }}
            />
            <div
              className="absolute left-[14%] top-[6%] size-[440px] rounded-full"
              style={{ background: "radial-gradient(circle, var(--hero-glow-2), transparent 66%)" }}
            />
            {/* повільний промінь-розгортка радара (обертається внутрішній шар) */}
            <div className="absolute left-1/2 top-1/2 size-[820px] -translate-x-1/2 -translate-y-1/2">
              <div
                className="hero-sweep size-full rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0deg, var(--hero-sweep-c) 16deg, transparent 44deg)",
                }}
              />
            </div>
            {/* кола радара */}
            <svg
              viewBox="0 0 600 600"
              className="absolute left-1/2 top-1/2 size-[780px] -translate-x-1/2 -translate-y-1/2"
              style={{ color: "var(--hero-radar)" }}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <circle cx="300" cy="300" r="90" />
              <circle cx="300" cy="300" r="170" />
              <circle cx="300" cy="300" r="250" />
              <circle cx="300" cy="300" r="300" />
              <path d="M300 300 566 148" />
              <circle cx="430" cy="220" r="4" fill="currentColor" stroke="none" />
            </svg>
            {/* кінозерно */}
            <div className="hero-grain absolute inset-0" />
            {/* верхня хвилька для глибини */}
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(to right, transparent, var(--hero-hairline), transparent)" }}
            />
          </div>

          <div className="relative mx-auto flex w-full max-w-[1080px] flex-col items-center px-4 py-28 text-center lg:py-36">
            <span className="hero-badge inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.16em] backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-accent shadow-[0_0_10px_2px_rgba(233,74,2,0.55)]" />
              Українські радіоелектронні системи
            </span>
            <h1 className="hero-h1 mt-7 font-display text-[36px] font-bold uppercase leading-[1.05] text-balance sm:text-[52px] lg:text-[64px]">
              Технології, що працюють там, де це дійсно важливо
            </h1>
            <p className="hero-soft mt-6 max-w-[600px] text-[15px] leading-relaxed">
              VANGUARD — український розробник і виробник радіоелектронних систем для виявлення
              та протидії сучасним повітряним загрозам.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/catalog"
                className="group inline-flex h-[50px] items-center gap-2 rounded-[10px] bg-submit px-7 text-[14px] font-semibold text-white shadow-[0_8px_30px_-8px_rgba(233,74,2,0.55)] transition-all hover:bg-accent-mid hover:shadow-[0_10px_38px_-6px_rgba(233,74,2,0.7)]"
              >
                Наша продукція
                <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/about"
                className="hero-ghost inline-flex h-[50px] items-center rounded-[10px] border px-7 text-[14px] font-semibold backdrop-blur-sm transition-colors"
              >
                Про компанію
              </Link>
            </div>
          </div>

          {/* Смуга статистики */}
          <div className="hero-strip relative border-t">
            <div className="hero-strip-grid mx-auto grid w-full max-w-[1100px] grid-cols-2 gap-y-6 px-4 py-8 lg:grid-cols-4">
              {STATS.map((s) => (
                <div key={s.label} className="px-2 text-center lg:px-6">
                  <div className="font-display text-[24px] font-bold leading-none text-accent lg:text-[30px]">
                    {s.value}
                  </div>
                  <div className="hero-stat-label mx-auto mt-2 max-w-[150px] text-[12px] leading-tight">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Ключова перевага ── */}
        <section className="bg-surface" aria-labelledby="advantage-heading">
          <div className="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:gap-14 lg:px-[67px] lg:py-24">
            <div>
              <h2
                id="advantage-heading"
                className="font-display text-[30px] font-bold uppercase leading-[1.12] text-ink lg:text-[42px]"
              >
                Розробляємо.<br />Виробляємо.<br />Захищаємо.
              </h2>
              <p className="mt-6 max-w-[520px] text-[14px] leading-relaxed text-ink-3">
                VANGUARD самостійно розробляє та виробляє радіоелектронні рішення — від
                проєктування й прототипування до серійного виробництва й підтримки. Ми контролюємо
                кожен етап, тому обладнання працює надійно навіть у найскладніших умовах.
              </p>
              <Link
                href="/about"
                className="mt-7 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent transition-opacity hover:opacity-80"
              >
                Дізнатися більше про компанію
                <IconArrowRight className="size-4" />
              </Link>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] border border-line-3">
              <Image
                src="/images/documentation/factory.png"
                alt="Власне виробництво радіоелектронних систем VANGUARD"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 640px"
                className="object-cover"
              />
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg/40 to-transparent" />
            </div>
          </div>
        </section>

        {/* ── Напрями продукції ── */}
        <section className="mx-auto w-full max-w-[1400px] px-4 py-16 lg:px-[67px] lg:py-20" aria-labelledby="directions-heading">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 id="directions-heading" className="font-display text-[26px] font-bold uppercase leading-tight text-ink lg:text-[32px]">
                Напрями продукції
              </h2>
              <p className="mt-1.5 text-[13px] text-ink-3">Обладнання для будь-яких умов та задач.</p>
            </div>
            <Link
              href="/catalog"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent transition-opacity hover:opacity-80"
            >
              Увесь каталог
              <IconArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {DIRECTIONS.map(({ name, desc, Icon }) => (
              <Link
                key={name}
                href="/catalog"
                className="group flex flex-col rounded-[12px] border border-card-line bg-card p-5 transition-colors hover:border-accent-deep"
              >
                <span className="flex size-11 items-center justify-center rounded-[10px] border border-line-2 bg-surface text-accent transition-colors group-hover:border-accent-deep">
                  <Icon className="size-6" />
                </span>
                <h3 className="mt-4 font-display text-[16px] font-bold uppercase leading-tight text-ink">{name}</h3>
                <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-ink-3">{desc}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-details">
                  Детальніше
                  <IconArrowRight className="size-4 text-ink transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          <AdvantagesStrip />
        </section>

        {/* ── Фінальний CTA ── */}
        <section className="border-t border-line-3 bg-surface">
          <div className="mx-auto flex w-full max-w-[1400px] flex-col items-start justify-between gap-5 px-4 py-14 sm:flex-row sm:items-center lg:px-[67px]">
            <div>
              <h2 className="font-display text-[24px] font-bold uppercase leading-tight text-ink lg:text-[30px]">
                Готові підібрати рішення під вашу задачу?
              </h2>
              <p className="mt-2 max-w-[520px] text-[13px] leading-relaxed text-ink-3">
                Залиште заявку — менеджер допоможе з конфігурацією, термінами й супроводом.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                href="/catalog"
                className="inline-flex h-[48px] items-center gap-2 rounded-[8px] bg-submit px-6 text-[14px] font-semibold text-white transition-colors hover:bg-accent-mid"
              >
                Переглянути каталог
                <IconArrowRight className="size-4" />
              </Link>
              <Link
                href="/contacts"
                className="inline-flex h-[48px] items-center rounded-[8px] border border-edge px-6 text-[14px] font-semibold text-ink-2 transition-colors hover:border-accent hover:text-ink"
              >
                Звʼязатися
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
