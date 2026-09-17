import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { ContactTrigger } from "@/components/contact/ContactDialog";
import JsonLd from "@/components/JsonLd";
import { IconArrowRight, IconChevronRight, IconHome } from "@/components/icons";
import { SITE_URL, breadcrumbLd } from "@/lib/seo";

/* Сторінка-порівняння засобів РЕБ (GEO-контент, пропозиція — макета немає).
   Мета: вигравати запити «який засіб РЕБ обрати», «порівняння РЕБ», «система РЕБ
   проти дронів» у пошуку й AI-відповідях. Значення — курований зріз реальних ТТХ
   із site/src/data/products.json (тримати синхронним, якщо ТТХ/ціни зміняться).
   КОЖАН 3.0 тут не згадується (рішення власника). */

export const metadata: Metadata = {
  title: "Засоби РЕБ проти БПЛА: порівняння та вибір — VANGUARD",
  description:
    "Порівняння засобів РЕБ VANGUARD — «КРАКЕН», «ГІДРА 2U», «ДОКАТКА», «ДЕЛЬФІН»: діапазони, потужність, форм-фактор і застосування. Як обрати систему протидії дронам під вашу задачу.",
  keywords: [
    "засоби РЕБ",
    "РЕБ проти дронів",
    "система протидії БПЛА",
    "порівняння РЕБ",
    "КРАКЕН РЕБ",
    "ГІДРА 2U",
    "ДОКАТКА",
    "ДЕЛЬФІН",
    "антидрон",
  ],
  alternates: { canonical: "/reb" },
  openGraph: {
    type: "website",
    url: "/reb",
    title: "Засоби РЕБ проти БПЛА: порівняння та вибір — VANGUARD",
    description:
      "«КРАКЕН», «ГІДРА 2U», «ДОКАТКА», «ДЕЛЬФІН» — діапазони, потужність, форм-фактор і застосування. Як обрати систему РЕБ під задачу.",
  },
};

type System = {
  slug: string;
  name: string;
  full: string;
  tagline: string;
  formFactor: string;
  band: string;
  channels: string;
  power: string;
  supply: string;
  weight: string;
  autostart: string;
  use: string;
};

const SYSTEMS: System[] = [
  {
    slug: "kraken",
    name: "КРАКЕН",
    full: "Система РЕБ «КРАКЕН»",
    tagline: "Модульний комплекс для стаціонарних позицій",
    formFactor: "Модульний, стаціонарний",
    band: "300–4100 МГц",
    channels: "Модульна (незалежні блоки)",
    power: "25–50 Вт / 100 МГц",
    supply: "24–28 В · LiFePO4 200 Аг",
    weight: "25–30 кг",
    autostart: "Так",
    use: "Стаціонарні позиції, опорні пункти",
  },
  {
    slug: "hydra-2u",
    name: "ГІДРА 2U",
    full: "Комплекс РЕБ «ГІДРА 2U»",
    tagline: "Мобільний комплекс для важкої техніки",
    formFactor: "Мобільний, 19″ стійка",
    band: "300–6000 МГц",
    channels: "8–20 каналів",
    power: "50 Вт / діапазон",
    supply: "12–24 В (авто) / 220 В",
    weight: "60–80 кг",
    autostart: "Так (опційно)",
    use: "Важка техніка, БТР, КШМ",
  },
  {
    slug: "dokatka",
    name: "ДОКАТКА",
    full: "Комплекс РЕБ «ДОКАТКА»",
    tagline: "Замаскований під колесо для прихованих позицій",
    formFactor: "Замаскований під вантажне колесо",
    band: "300–6000 МГц",
    channels: "До 12 (4–6 у колесі)",
    power: "50–100 Вт / діапазон",
    supply: "12–24 В (авто) / 220 В",
    weight: "30–40 кг",
    autostart: "Так",
    use: "Приховане розгортання, висунуті позиції",
  },
  {
    slug: "delfin",
    name: "ДЕЛЬФІН",
    full: "Комплекс РЕБ «ДЕЛЬФІН»",
    tagline: "Замаскований під дах авто для логістики",
    formFactor: "Замаскований під дах авто",
    band: "300–6000 МГц",
    channels: "До 13 модулів",
    power: "50–100 Вт / модуль",
    supply: "220 В / 12–24 В (авто) · LiFePO4 200 Аг",
    weight: "60–80 кг",
    autostart: "Так",
    use: "Логістика, «сіра зона», супровід",
  },
];

const ROWS: { label: string; key: keyof System }[] = [
  { label: "Тип / форм-фактор", key: "formFactor" },
  { label: "Робочий діапазон", key: "band" },
  { label: "Діапазони / канали", key: "channels" },
  { label: "Потужність завади", key: "power" },
  { label: "Живлення", key: "supply" },
  { label: "Орієнтовна вага", key: "weight" },
  { label: "Автозапуск від «КОЖАН»", key: "autostart" },
  { label: "Основне застосування", key: "use" },
];

const itemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Засоби РЕБ VANGUARD",
  itemListElement: SYSTEMS.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.full,
    url: `${SITE_URL}/products/${s.slug}`,
  })),
};

export default function RebPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Головна", path: "/" },
          { name: "Каталог", path: "/catalog" },
          { name: "Засоби РЕБ", path: "/reb" },
        ])}
      />
      <JsonLd data={itemListLd} />
      <SiteHeader active="Каталог" />
      <main className="mx-auto w-full max-w-[1536px] flex-1 px-4 pb-16 lg:px-[67px]">
        <nav aria-label="Хлібні крихти" className="mt-3 flex items-center gap-2 text-[10px] leading-[14px]">
          <IconHome className="size-3.5 text-ink-3" />
          <Link href="/" className="transition-colors hover:text-ink-2">Головна</Link>
          <IconChevronRight aria-hidden className="size-3.5 text-ink-3" />
          <Link href="/catalog" className="transition-colors hover:text-ink-2">Каталог</Link>
          <IconChevronRight aria-hidden className="size-3.5 text-ink-3" />
          <span aria-current="page" className="text-ink-2">Засоби РЕБ</span>
        </nav>

        <header className="mt-5 max-w-[760px]">
          <h1 className="font-display text-[26px] font-bold uppercase leading-tight text-ink lg:text-[32px]">
            Засоби РЕБ проти БПЛА
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-3 lg:text-[14px]">
            Засіб РЕБ (радіоелектронної боротьби) придушує радіоканали дрона — керування, відеосигнал,
            передачу даних і супутникову навігацію — створюючи спрямовані завади. Засоби VANGUARD
            працюють у діапазоні 300–6000 МГц (залежно від моделі), виконуються як стаціонарні,
            мобільні або замасковані комплекси й підтримують автозапуск від детектора «КОЖАН».
            Нижче — порівняння чотирьох систем, щоб обрати під вашу задачу.
          </p>
        </header>

        {/* Порівняльна таблиця — головний GEO-артефакт; горизонтальний скрол на вузьких екранах */}
        <div className="mt-7 overflow-x-auto rounded-[12px] border border-line-3">
          <table className="w-full min-w-[720px] border-collapse text-[13px]">
            <thead>
              <tr className="bg-surface">
                <th scope="col" className="sticky left-0 z-10 bg-surface px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-wide text-ink-4">
                  Характеристика
                </th>
                {SYSTEMS.map((s) => (
                  <th key={s.slug} scope="col" className="px-4 py-3 text-left align-top">
                    <Link href={`/products/${s.slug}`} className="font-display text-[14px] font-bold uppercase leading-tight text-ink transition-colors hover:text-accent">
                      {s.name}
                    </Link>
                    <span className="mt-1 block text-[11px] font-normal normal-case leading-4 text-ink-4">{s.tagline}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line-3">
              {ROWS.map((r) => (
                <tr key={r.key} className="align-top">
                  <th scope="row" className="sticky left-0 z-10 bg-bg px-4 py-3 text-left text-[12px] font-medium text-ink-4">
                    {r.label}
                  </th>
                  {SYSTEMS.map((s) => (
                    <td key={s.slug} className="px-4 py-3 text-ink-2">{s[r.key]}</td>
                  ))}
                </tr>
              ))}
              <tr className="align-top">
                <th scope="row" className="sticky left-0 z-10 bg-bg px-4 py-3 text-left text-[12px] font-medium text-ink-4">
                  Ціна
                </th>
                {SYSTEMS.map((s) => (
                  <td key={s.slug} className="px-4 py-3 text-ink-3">За запитом</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] leading-4 text-ink-5">
          Точну ціну, набір діапазонів і комплектацію під вашу задачу підтвердить менеджер за заявкою.
        </p>

        {/* Як обрати — задача → система */}
        <section className="mt-10">
          <h2 className="font-display text-[18px] font-bold uppercase leading-tight text-ink">Як обрати засіб РЕБ</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SYSTEMS.map((s) => (
              <Link
                key={s.slug}
                href={`/products/${s.slug}`}
                className="group rounded-[10px] border border-line-3 bg-surface p-4 transition-colors hover:border-accent-deep"
              >
                <div className="text-[10px] uppercase tracking-wide text-ink-5">{s.use}</div>
                <div className="mt-1.5 font-display text-[15px] font-bold uppercase leading-tight text-ink transition-colors group-hover:text-accent">
                  {s.name}
                </div>
                <div className="mt-1 text-[12px] leading-relaxed text-ink-3">
                  {s.band} · {s.power}
                </div>
                <span className="mt-2 inline-flex items-center gap-1 text-[12px] text-accent">
                  Детальніше <IconChevronRight className="size-3.5" />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <p className="mt-8 max-w-[760px] text-[13px] leading-relaxed text-ink-3">
          Детектор «КОЖАН» і засіб РЕБ найкраще працюють у парі: детектор виявляє БПЛА за радіосигналом і
          завчасно попереджає оператора, а сумісний засіб РЕБ автоматично вмикається за виявленою ціллю.
          Дивіться також{" "}
          <Link href="/catalog?category=reb" className="text-accent transition-colors hover:text-accent-mid">увесь каталог РЕБ</Link>{" "}
          та{" "}
          <Link href="/faq" className="text-accent transition-colors hover:text-accent-mid">часті запитання</Link>.
        </p>

        <section className="mt-8 flex flex-col items-start justify-between gap-4 rounded-[12px] border border-line-3 bg-cta px-6 py-5 sm:flex-row sm:items-center lg:px-8">
          <div>
            <h2 className="font-display text-[18px] font-bold uppercase leading-tight text-ink">
              Підібрати РЕБ під задачу
            </h2>
            <p className="mt-1.5 max-w-[440px] text-[12px] leading-relaxed text-ink-3">
              Опишіть позицію й загрозу — менеджер порадить модель, набір діапазонів і комплектацію.
            </p>
          </div>
          <ContactTrigger className="inline-flex h-[46px] shrink-0 items-center gap-2 rounded-[8px] bg-accent-mid px-5 text-[14px] font-semibold text-white transition-colors hover:bg-accent">
            Отримати консультацію
            <IconArrowRight className="size-4" />
          </ContactTrigger>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
