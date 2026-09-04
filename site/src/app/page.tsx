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
   (макета ще немає). Статичний контент, БД не потрібна. */

export const metadata: Metadata = {
  title: "VANGUARD — радіоелектронні системи виявлення та протидії БПЛА",
  description:
    "VANGUARD — український розробник і виробник радіоелектронних систем для виявлення та протидії сучасним повітряним загрозам. Власна розробка, виробництво й підтримка.",
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
        {/* ── Hero ── */}
        <section className="relative overflow-hidden border-b border-line-3">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-1/2 size-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(233,74,2,0.12),transparent_60%)]" />
            <svg
              viewBox="0 0 600 600"
              className="absolute left-1/2 top-1/2 size-[680px] -translate-x-1/2 -translate-y-1/2 text-ink opacity-[0.06]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              <circle cx="300" cy="300" r="80" />
              <circle cx="300" cy="300" r="160" />
              <circle cx="300" cy="300" r="240" />
              <circle cx="300" cy="300" r="300" />
              <path d="M300 300 566 148" />
              <circle cx="430" cy="220" r="4" fill="currentColor" stroke="none" />
            </svg>
          </div>

          <div className="relative mx-auto flex w-full max-w-[1080px] flex-col items-center px-4 py-24 text-center lg:py-32">
            <span className="inline-flex items-center gap-2 rounded-full border border-line-2 bg-surface/60 px-4 py-1.5 text-[11px] uppercase tracking-[0.14em] text-ink-3 backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-accent" />
              Українські радіоелектронні системи
            </span>
            <h1 className="mt-6 font-display text-[34px] font-bold uppercase leading-[1.06] text-balance text-ink sm:text-[48px] lg:text-[60px]">
              Технології, що працюють там, де це дійсно важливо
            </h1>
            <p className="mt-6 max-w-[580px] text-[15px] leading-relaxed text-ink-3">
              VANGUARD — український розробник і виробник радіоелектронних систем для виявлення
              та протидії сучасним повітряним загрозам.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/catalog"
                className="inline-flex h-[48px] items-center gap-2 rounded-[8px] bg-submit px-6 text-[14px] font-semibold text-white transition-colors hover:bg-accent-mid"
              >
                Наша продукція
                <IconArrowRight className="size-4" />
              </Link>
              <Link
                href="/about"
                className="inline-flex h-[48px] items-center rounded-[8px] border border-edge px-6 text-[14px] font-semibold text-ink-2 transition-colors hover:border-accent hover:text-ink"
              >
                Про компанію
              </Link>
            </div>
          </div>

          {/* Смуга статистики */}
          <div className="relative border-t border-line-3 bg-bg/40">
            <div className="mx-auto grid w-full max-w-[1100px] grid-cols-2 gap-y-6 px-4 py-7 lg:grid-cols-4 lg:divide-x lg:divide-line-3">
              {STATS.map((s) => (
                <div key={s.label} className="px-2 text-center lg:px-6">
                  <div className="font-display text-[24px] font-bold leading-none text-[#ff4d00] lg:text-[28px]">
                    {s.value}
                  </div>
                  <div className="mx-auto mt-2 max-w-[150px] text-[12px] leading-tight text-ink-3">
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
