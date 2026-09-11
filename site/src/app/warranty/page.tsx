import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ContactTrigger } from "@/components/contact/ContactDialog";
import { IconArrowRight, IconCheck, IconChevronRight, IconHome } from "@/components/icons";

/* Сторінка «Гарантія» — пропозиція в наявній дизайн-мові (макета ще немає).
   Термін 12 міс відповідає полю warrantyMonths у каталозі; точні умови для
   конкретної моделі власник підтверджує окремо (див. примітку внизу). */

export const metadata: Metadata = {
  title: "Гарантія — VANGUARD",
  description:
    "Гарантійні умови на обладнання VANGUARD: гарантійний термін, що покриває гарантія та як звернутися по сервіс.",
  alternates: { canonical: "/warranty" },
};

const COVERED = [
  "Виробничі дефекти матеріалів і складання",
  "Несправності електроніки за нормальної експлуатації",
  "Заводські дефекти корпусу та розʼємів",
];

const NOT_COVERED = [
  "Механічні пошкодження, удари, потрапляння вологи поза межами класу захисту (IP)",
  "Наслідки неправильного підключення живлення чи експлуатації не за призначенням",
  "Самостійний ремонт або втручання в конструкцію виробу",
  "Природний знос елементів живлення (АКБ) та витратних матеріалів",
];

const STEPS = [
  { n: "1", title: "Залиште заявку", text: "Напишіть нам через форму або менеджера — вкажіть модель і серійний номер." },
  { n: "2", title: "Опишіть несправність", text: "Коротко опишіть проблему; за можливості додайте фото чи відео." },
  { n: "3", title: "Отримайте рішення", text: "Ми узгодимо діагностику, ремонт або заміну в межах гарантії." },
];

export default function WarrantyPage() {
  return (
    <>
      <SiteHeader active="Гарантія" />
      <main className="mx-auto w-full max-w-[1536px] flex-1 px-4 pb-16 lg:px-[67px]">
        <nav aria-label="Хлібні крихти" className="mt-3 flex items-center gap-2 text-[10px] leading-[14px]">
          <IconHome className="size-3.5 text-ink-3" />
          <Link href="/" className="transition-colors hover:text-ink-2">Головна</Link>
          <IconChevronRight aria-hidden className="size-3.5 text-ink-3" />
          <span aria-current="page" className="text-ink-2">Гарантія</span>
        </nav>

        <header className="mt-5 max-w-[720px]">
          <h1 className="font-display text-[26px] font-bold uppercase leading-tight text-ink lg:text-[32px]">
            Гарантія
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-3 lg:text-[14px]">
            VANGUARD надає гарантію на все обладнання власного виробництва та супроводжує
            продукт від передачі до завершення гарантійного строку.
          </p>
        </header>

        {/* Термін */}
        <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-[12px] border border-line-3 bg-surface px-6 py-5">
          <span className="font-display text-[34px] font-bold leading-none text-accent">12</span>
          <div>
            <div className="text-[14px] font-semibold text-ink">місяців гарантії</div>
            <div className="text-[12px] text-ink-4">з дати передачі обладнання</div>
          </div>
        </div>

        {/* Покриття */}
        <div className="mt-8 grid gap-6 lg:max-w-[860px] lg:grid-cols-2">
          <section className="rounded-[10px] border border-line-3 bg-surface p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Що покриває гарантія</h2>
            <ul className="mt-3 space-y-2.5">
              {COVERED.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-2">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-ok/15 text-ok">
                    <IconCheck className="size-2.5" />
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-[10px] border border-line-3 bg-surface p-5">
            <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Що не входить у гарантію</h2>
            <ul className="mt-3 space-y-2.5">
              {NOT_COVERED.map((c) => (
                <li key={c} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-3">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-ink-5" />
                  {c}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Як звернутися */}
        <section className="mt-10 lg:max-w-[860px]">
          <h2 className="font-display text-[18px] font-bold uppercase leading-tight text-ink">Як звернутися по гарантію</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-[10px] border border-line-3 bg-surface p-4">
                <span className="flex size-7 items-center justify-center rounded-full border border-accent-deep text-[12px] font-semibold text-accent">
                  {s.n}
                </span>
                <div className="mt-3 text-[13px] font-semibold text-ink">{s.title}</div>
                <p className="mt-1 text-[12px] leading-relaxed text-ink-4">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ContactTrigger className="inline-flex h-[46px] items-center gap-2 rounded-[8px] bg-submit px-6 text-[14px] font-semibold text-white transition-colors hover:bg-accent-mid">
              Звернутися по сервіс
              <IconArrowRight className="size-4" />
            </ContactTrigger>
            <Link href="/contacts" className="text-[13px] text-ink-3 transition-colors hover:text-ink">
              Усі контакти →
            </Link>
          </div>
        </section>

        <p className="mt-8 max-w-[720px] text-[11px] leading-4 text-ink-5">
          Наведені умови є загальними. Точні гарантійні умови для конкретної моделі
          уточнюйте у менеджера під час замовлення.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
