import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AdvantagesStrip from "@/components/AdvantagesStrip";
import { IconArrowRight, IconChevronRight, IconHome } from "@/components/icons";

export const metadata: Metadata = {
  title: "Рішення — VANGUARD",
  description:
    "Комплексні рішення для захисту від безпілотних загроз: підібрані конфігурації обладнання VANGUARD для різних задач і умов.",
};

// Контент сторінки (за Figma Desktop / Solutions). Демо-набір — до переліку від власника.
type Solution = {
  title: string;
  description: string;
  tags: string[];
  href: string;
};

const SOLUTIONS: Solution[] = [
  {
    title: "Захист рухомих груп",
    description:
      "Комплексне рішення для захисту підрозділів під час пересування та виконання завдань.",
    tags: ["Виявлення", "РЕБ", "Антени", "Живлення"],
    href: "#request",
  },
  {
    title: "Стаціонарний пост",
    description:
      "Постійний контроль повітряного простору навколо об'єкта та завчасне попередження.",
    tags: ["Виявлення", "Антени", "24/7"],
    href: "#request",
  },
  {
    title: "Мобільна група",
    description:
      "Компактний комплект для швидкого розгортання силами невеликого підрозділу.",
    tags: ["Виявлення", "Портативність", "Живлення"],
    href: "#request",
  },
  {
    title: "Периметр об'єкта",
    description:
      "Багаторівневий захист периметра критичної інфраструктури від БПЛА.",
    tags: ["Виявлення", "РЕБ", "Периметр"],
    href: "#request",
  },
];

function SolutionCard({ s }: { s: Solution }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-[12px] border border-card-line bg-card">
      <div className="relative">
        <div className="relative h-[150px]">
          <Image
            src="/images/solutions/card-bg.png"
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 340px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
        </div>
        {/* Прев'ю продуктів комплекту */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex h-[62px] flex-1 items-center justify-center rounded-[6px] border border-line-3 bg-surface/80 backdrop-blur-sm"
            >
              <Image
                src="/images/solutions/preview.png"
                alt=""
                width={54}
                height={56}
                className="h-[56px] w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap gap-1.5">
          {s.tags.map((t) => (
            <span
              key={t}
              className="rounded-[4px] border border-chip-line px-2 py-0.5 text-[11px] leading-5 text-ink-2"
            >
              {t}
            </span>
          ))}
        </div>
        <h3 className="mt-3 font-display text-[17px] font-bold uppercase leading-tight text-ink">
          {s.title}
        </h3>
        <p className="mt-1.5 flex-1 text-[12px] leading-relaxed text-ink-3">
          {s.description}
        </p>
        <Link
          href={s.href}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-details transition-opacity hover:opacity-80"
        >
          Детальніше
          <IconArrowRight className="size-4 text-ink" />
        </Link>
      </div>
    </article>
  );
}

export default function SolutionsPage() {
  return (
    <>
      <SiteHeader active="Рішення" />
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
          <span aria-current="page">Рішення</span>
        </nav>

        {/* Hero */}
        <section className="relative mt-3 overflow-hidden rounded-[14px] border border-line-3">
          <Image
            src="/images/solutions/hero.png"
            alt="Рішення VANGUARD для протидії БПЛА"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/40"
          />
          <div className="relative max-w-[560px] px-6 py-6 lg:px-10 lg:py-7">
            <h1 className="font-display text-[28px] font-bold uppercase leading-tight text-ink lg:text-[34px]">
              Рішення
            </h1>
            <p className="mt-2 max-w-[460px] text-[13px] leading-relaxed text-ink-3">
              Комплексні рішення для захисту від безпілотних загроз. Підібрані
              конфігурації обладнання для різних задач і умов.
            </p>
          </div>
        </section>

        {/* Готові рішення */}
        <section className="mt-6" aria-labelledby="solutions-heading">
          <div className="flex flex-col gap-1">
            <h2
              id="solutions-heading"
              className="font-display text-[18px] font-bold uppercase leading-tight text-ink"
            >
              Готові рішення
            </h2>
            <p className="text-[12px] text-ink-3">
              Перевірені конфігурації для найпоширеніших сценаріїв застосування.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {SOLUTIONS.map((s) => (
              <SolutionCard key={s.title} s={s} />
            ))}
          </div>
        </section>

        <AdvantagesStrip />
      </main>
      <SiteFooter />
    </>
  );
}
