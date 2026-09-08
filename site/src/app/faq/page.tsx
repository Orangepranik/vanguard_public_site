import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ContactTrigger } from "@/components/contact/ContactDialog";
import { IconArrowRight, IconChevronDown, IconChevronRight, IconHome } from "@/components/icons";

/* Сторінка «Часті запитання» — пропозиція в наявній дизайн-мові (макета ще немає).
   Відповіді спираються на ухвалені правила проєкту (продаж через заявку, конфігуратор,
   сумісність КОЖАН+РЕБ, гарантія 12 міс); власник може уточнити формулювання. */

export const metadata: Metadata = {
  title: "Часті запитання — VANGUARD",
  description:
    "Відповіді на поширені запитання про замовлення, ціни, конфігурацію, сумісність, гарантію та підтримку обладнання VANGUARD.",
};

const GROUPS: { title: string; items: { q: string; a: ReactNode }[] }[] = [
  {
    title: "Замовлення та ціни",
    items: [
      {
        q: "Як придбати обладнання?",
        a: "Продаж — через заявку: додайте товар, залиште контакти, і менеджер звʼяжеться, узгодить конфігурацію, оплату та доставку. Онлайн-кошика й оплати на сайті немає — так безпечніше й точніше під вашу задачу.",
      },
      {
        q: "Чому в деяких товарів «Ціна за запитом»?",
        a: "Частина позицій має публічну ціну («від …» для конфігурованих), частина — за запитом: остаточна вартість залежить від комплектації та наявності. Менеджер надасть точну ціну під ваш запит.",
      },
      {
        q: "Чи можна змінити комплектацію?",
        a: "Так. У товарів із конфігуратором ви обираєте виконання чи опції (наприклад, виносну антену для детектора) — ціна перераховується автоматично.",
      },
      {
        q: "Чи є обладнання в наявності?",
        a: "Наявність уточнюйте у менеджера: частину позицій відвантажуємо зі складу, частину — виготовляємо під замовлення. Поточний статус показано на картці товару.",
      },
    ],
  },
  {
    title: "Продукти та сумісність",
    items: [
      {
        q: "Чим детектор відрізняється від засобу РЕБ?",
        a: "Детектор («КОЖАН») виявляє БПЛА та канали звʼязку й попереджає оператора; засіб РЕБ («КРАКЕН», «ГІДРА», «ДОКАТКА», «ДЕЛЬФІН») придушує канали керування, звʼязку та навігації.",
      },
      {
        q: "Чи працюють детектор і РЕБ разом?",
        a: "Так. Детектор «КОЖАН» може автоматично запускати сумісні засоби РЕБ за сигналом про ціль — це зменшує ручну роботу оператора. Сумісність указана на сторінці кожного товару.",
      },
      {
        q: "Ви розробляєте й виробляєте обладнання самостійно?",
        a: "Так, VANGUARD самостійно розробляє та виробляє радіоелектронні системи в Україні.",
      },
    ],
  },
  {
    title: "Гарантія та підтримка",
    items: [
      {
        q: "Яка гарантія на обладнання?",
        a: (
          <>
            Гарантія — 12 місяців з дати передачі. Що покриває гарантія та як звернутися —
            на сторінці{" "}
            <Link href="/warranty" className="text-accent transition-colors hover:text-accent-mid">
              «Гарантія»
            </Link>
            .
          </>
        ),
      },
      {
        q: "Де знайти документацію на продукт?",
        a: "Технічні документи доступні в розділі «Документація» на сторінці відповідного товару в каталозі.",
      },
      {
        q: "Як з вами звʼязатися?",
        a: (
          <>
            Залиште заявку через форму (кнопка «Звʼязатися»), зателефонуйте або напишіть у
            Telegram — усі канали на сторінці{" "}
            <Link href="/contacts" className="text-accent transition-colors hover:text-accent-mid">
              «Контакти»
            </Link>
            .
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader active="FAQ" />
      <main className="mx-auto w-full max-w-[1536px] flex-1 px-4 pb-16 lg:px-[67px]">
        <nav aria-label="Хлібні крихти" className="mt-3 flex items-center gap-2 text-[10px] leading-[14px]">
          <IconHome className="size-3.5 text-ink-3" />
          <Link href="/" className="transition-colors hover:text-ink-2">Головна</Link>
          <IconChevronRight aria-hidden className="size-3.5 text-ink-3" />
          <span aria-current="page" className="text-ink-2">Часті запитання</span>
        </nav>

        <header className="mt-5 max-w-[720px]">
          <h1 className="font-display text-[26px] font-bold uppercase leading-tight text-ink lg:text-[32px]">
            Часті запитання
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-3 lg:text-[14px]">
            Коротко про те, як замовити, з чого складається ціна, як працює обладнання разом
            і що з гарантією. Не знайшли відповідь — напишіть нам.
          </p>
        </header>

        <div className="mt-7 grid gap-x-6 gap-y-8 lg:grid-cols-3 lg:items-start">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-4">{g.title}</h2>
              <div className="mt-3 space-y-2.5">
                {g.items.map((it) => (
                  <details
                    key={it.q}
                    className="group rounded-[10px] border border-line-3 bg-surface [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-3.5 text-[14px] font-medium text-ink">
                      {it.q}
                      <IconChevronDown className="size-4 shrink-0 text-ink-3 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-5 pb-4 text-[13px] leading-relaxed text-ink-3">{it.a}</div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-10 flex flex-col items-start justify-between gap-4 rounded-[12px] border border-line-3 bg-[#070c11] px-6 py-5 sm:flex-row sm:items-center lg:px-8">
          <div>
            <h2 className="font-display text-[18px] font-bold uppercase leading-tight text-ink">
              Не знайшли відповідь?
            </h2>
            <p className="mt-1.5 max-w-[420px] text-[12px] leading-relaxed text-ink-3">
              Залиште заявку — менеджер відповість на будь-яке запитання щодо обладнання.
            </p>
          </div>
          <ContactTrigger className="inline-flex h-[46px] shrink-0 items-center gap-2 rounded-[8px] bg-accent-mid px-5 text-[14px] font-semibold text-white transition-colors hover:bg-accent">
            Поставити запитання
            <IconArrowRight className="size-4" />
          </ContactTrigger>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
