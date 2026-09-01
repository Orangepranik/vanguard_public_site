import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { IconArrowRight, IconChevronRight, IconHome } from "@/components/icons";

export const metadata: Metadata = {
  title: "Про компанію — VANGUARD",
  description:
    "VANGUARD — український розробник і виробник радіоелектронних систем для виявлення та протидії сучасним повітряним загрозам.",
};

const ACTIVITIES: { title: string; description: string }[] = [
  {
    title: "Розробка",
    description:
      "Дослідження, проектування та розробка радіоелектронних систем з урахуванням реальних потреб користувачів.",
  },
  {
    title: "Виробництво",
    description:
      "Серійне виробництво з контролем якості на власних потужностях в Україні.",
  },
  {
    title: "Випробування",
    description:
      "Лабораторні та польові випробування обладнання в реальних умовах експлуатації.",
  },
  {
    title: "Підтримка",
    description:
      "Технічна підтримка, супровід та оновлення рішень протягом усього терміну служби.",
  },
];

const PROCESS: { title: string; description: string }[] = [
  { title: "Аналіз задачі", description: "Вивчаємо умови та вимоги для формування технічного завдання." },
  { title: "Проєктування", description: "Розробляємо технічні рішення та створюємо прототипи пристроїв." },
  { title: "Випробування", description: "Проводимо лабораторні та польові випробування прототипів." },
  { title: "Виробництво", description: "Запускаємо серійне виробництво з контролем якості." },
  { title: "Налаштування", description: "Проводимо налаштування та тестування кожного виробу." },
  { title: "Постачання", description: "Організовуємо доставку та супровід обладнання до користувача." },
  { title: "Підтримка", description: "Забезпечуємо технічну підтримку та оновлення рішень." },
];

const STATS: { value: string; label: string }[] = [
  { value: "Постійна", label: "технічна підтримка та розвиток" },
  { value: "Власне", label: "виробництво в Україні" },
  { value: "10+", label: "років досвіду розробки" },
  { value: "100+", label: "випробувань у реальних умовах" },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader active="Про компанію" />
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
          <span aria-current="page">Про компанію</span>
        </nav>

        {/* Hero */}
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
          <div className="relative max-w-[600px] px-6 py-6 lg:px-10 lg:py-8">
            <h1 className="font-display text-[28px] font-bold uppercase leading-tight text-ink lg:text-[34px]">
              Про компанію
            </h1>
            <p className="mt-2.5 max-w-[480px] text-[13px] leading-relaxed text-ink-3">
              VANGUARD — український розробник і виробник радіоелектронних систем для
              виявлення та протидії сучасним повітряним загрозам.
            </p>
            <p className="mt-2 max-w-[480px] text-[12px] leading-relaxed text-ink-4">
              Ми створюємо надійні рішення для професіоналів, які працюють у
              найскладніших умовах.
            </p>
          </div>
        </section>

        {/* Наша діяльність */}
        <section className="mt-6" aria-labelledby="activity-heading">
          <h2
            id="activity-heading"
            className="font-display text-[18px] font-bold uppercase leading-tight text-ink"
          >
            Наша діяльність
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {ACTIVITIES.map((a) => (
              <div
                key={a.title}
                className="rounded-[12px] border border-card-line bg-card p-5"
              >
                <h3 className="font-display text-[15px] font-bold uppercase leading-tight text-ink-2">
                  {a.title}
                </h3>
                <p className="mt-2 text-[12px] leading-relaxed text-ink-3">
                  {a.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Процес роботи */}
        <section className="mt-7" aria-labelledby="process-heading">
          <h2
            id="process-heading"
            className="font-display text-[18px] font-bold uppercase leading-tight text-ink"
          >
            Процес роботи
          </h2>
          <div className="relative mt-5">
            <span
              aria-hidden
              className="absolute inset-x-0 top-[13px] hidden h-px bg-edge xl:block"
            />
            <ol className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
              {PROCESS.map((step, i) => (
                <li key={step.title} className="relative flex flex-col">
                  <span className="flex size-7 items-center justify-center rounded-full border border-edge bg-bg text-[12px] font-semibold text-ink">
                    {i + 1}
                  </span>
                  <h3 className="mt-3 text-[13px] font-semibold text-ink-2">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-[11px] leading-relaxed text-ink-4">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Статистика */}
        <section
          className="mt-7 rounded-[12px] border border-adv-line bg-[#070c11] px-5 py-5 lg:px-8"
          aria-label="Компанія в цифрах"
        >
          <div className="grid grid-cols-2 gap-y-6 lg:grid-cols-4 lg:divide-x lg:divide-divider">
            {STATS.map((s) => (
              <div key={s.label} className="px-2 text-center lg:px-6">
                <div className="font-display text-[26px] font-bold leading-none text-[#ff4d00]">
                  {s.value}
                </div>
                <div className="mx-auto mt-2 max-w-[130px] text-[12px] leading-tight text-ink-3">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[12px] border border-line-3 bg-[#070c11] px-6 py-5 sm:flex-row sm:items-center lg:px-8">
          <div>
            <h2 className="font-display text-[18px] font-bold uppercase leading-tight text-ink">
              Хочете дізнатись більше?
            </h2>
            <p className="mt-1.5 max-w-[420px] text-[12px] leading-relaxed text-ink-3">
              Наші спеціалісти готові відповісти на ваші запитання та допомогти з
              вибором рішення.
            </p>
          </div>
          <Link
            href="#request"
            className="inline-flex h-[46px] shrink-0 items-center gap-2 rounded-[8px] bg-accent-mid px-5 text-[14px] font-semibold text-white transition-colors hover:bg-accent"
          >
            Зв&apos;язатися з нами
            <IconArrowRight className="size-4" />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
