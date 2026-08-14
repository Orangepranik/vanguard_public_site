import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconFacebook,
  IconInstagram,
  IconTelegram,
  IconYoutube,
} from "./icons";

/* Футер — Figma catalog_page, фрейми "Footer / Main" + "Footer / Bottom".
   Адаптив: mobile — стек; md — дві колонки; xl — один рядок, як у макеті (129px). */

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase leading-[14px] tracking-wide text-[#E7E9EA]">
        {heading}
      </h3>
      <ul className="mt-2 space-y-[3px]">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="block text-[10px] leading-4 text-[#9EA3A7] transition-colors hover:text-ink-2"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SiteFooter() {
  return (
    <footer>
      <div className="bg-surface">
        <div className="mx-auto grid w-full max-w-[1536px] gap-7 px-5 py-4 md:grid-cols-2 lg:px-[55px] xl:grid-cols-[auto_190px_1px_1fr_1px_220px] xl:items-start xl:gap-5">
          <div className="flex items-start">
            <Image
              src="/images/brand/logo-full.png"
              alt="VANGUARD — Ukrainian Radioelectronic Systems"
              width={150}
              height={59}
            />
          </div>

          <div className="max-w-[240px]">
            <p className="text-[10px] leading-4 text-[#999EA3]">
              Розробляємо та виробляємо радіоелектронні системи для захисту від
              сучасних повітряних загроз.
            </p>
            <div className="mt-3 flex items-center gap-4">
              <a href="#" aria-label="Instagram"><IconInstagram className="size-[18px]" /></a>
              <a href="#" aria-label="Facebook"><IconFacebook className="size-[18px]" /></a>
              <a href="#" aria-label="YouTube"><IconYoutube className="size-[18px]" /></a>
              <a href="#" aria-label="Telegram"><IconTelegram className="size-[18px]" /></a>
            </div>
          </div>

          <span aria-hidden className="hidden w-px self-stretch bg-divider xl:block" />

          <div className="grid grid-cols-2 gap-7 sm:grid-cols-4 md:col-span-2 lg:gap-6 xl:col-span-1">
            <FooterCol
              heading="Продукція"
              links={[
                { label: "Детектори", href: "/catalog" },
                { label: "РЕБ системи", href: "/catalog" },
                { label: "Антени", href: "/catalog" },
                { label: "Комплекти", href: "/catalog" },
              ]}
            />
            <FooterCol
              heading="Компанія"
              links={[
                { label: "Про нас", href: "#" },
                { label: "Виробництво", href: "#" },
                { label: "Новини", href: "#" },
                { label: "Кар'єра", href: "#" },
              ]}
            />
            <FooterCol
              heading="Підтримка"
              links={[
                { label: "Документація", href: "#" },
                { label: "Гарантія", href: "#" },
                { label: "FAQ", href: "#" },
                { label: "Сервісні центри", href: "#" },
              ]}
            />
            <FooterCol
              heading="Контакти"
              links={[
                { label: "+38 (060) 840 35 20", href: "tel:+380608403520" },
                { label: "vanguardltd25@gmail.com", href: "mailto:vanguardltd25@gmail.com" },
                { label: "Україна", href: "#" },
                { label: "@VANGUARDSALE", href: "#" },
              ]}
            />
          </div>

          <span aria-hidden className="hidden w-px self-stretch bg-divider xl:block" />

          <div className="w-full max-w-[280px] xl:max-w-none">
            <h3 className="text-[10px] font-semibold uppercase leading-[14px] tracking-wide text-[#E8E9EA]">
              Підписатися на новини
            </h3>
            <p className="mt-1.5 text-[10px] leading-4 text-[#959A9F]">
              Будьте в курсі новинок та оновлень
            </p>
            <form
              className="mt-2 flex h-[33px] items-center overflow-hidden rounded-[6px] border border-edge bg-inset"
              aria-label="Підписка на новини"
            >
              <input
                type="email"
                placeholder="Ваш email"
                aria-label="Email для розсилки"
                className="h-full w-full bg-transparent pl-3.5 text-[11px] text-ink placeholder:text-[#858B90] focus:outline-none"
              />
              <button
                type="button"
                title="Підписка запрацює після підключення розсилки"
                className="flex h-full w-[42px] shrink-0 items-center justify-center rounded-[6px] bg-submit transition-colors hover:bg-accent-mid"
                aria-label="Підписатися"
              >
                <IconArrowRight className="size-5 text-white" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1536px] flex-col gap-2 px-5 py-3.5 text-[10px] leading-[14px] text-[#858A8F] sm:flex-row sm:items-center sm:justify-between lg:px-[67px]">
        <span>© 2026 VANGUARD. Усі права захищені.</span>
        <span className="flex gap-8">
          <Link href="#" className="transition-colors hover:text-ink-2">
            Політика конфіденційності
          </Link>
          <Link href="#" className="transition-colors hover:text-ink-2">
            Умови використання
          </Link>
        </span>
      </div>
    </footer>
  );
}
