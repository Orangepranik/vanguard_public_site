import Image from "next/image";
import Link from "next/link";
import {
  IconArrowRight,
  IconInstagram,
  IconTelegram,
  IconTikTok,
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
  const cls =
    "block text-[10px] leading-4 text-ink-4 transition-colors hover:text-ink-2";
  return (
    <div>
      <h3 className="text-[10px] font-semibold uppercase leading-[14px] tracking-wide text-ink-2">
        {heading}
      </h3>
      <ul className="mt-2 space-y-[3px]">
        {links.map((l) => (
          <li key={l.label}>
            {l.href.startsWith("http") ? (
              <a href={l.href} target="_blank" rel="noopener noreferrer" className={cls}>
                {l.label}
              </a>
            ) : l.href.startsWith("mailto:") || l.href.startsWith("tel:") ? (
              <a href={l.href} className={cls}>
                {l.label}
              </a>
            ) : (
              <Link href={l.href} className={cls}>
                {l.label}
              </Link>
            )}
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
            <p className="text-[10px] leading-4 text-ink-4">
              Розробляємо та виробляємо радіоелектронні системи для захисту від
              сучасних повітряних загроз.
            </p>
            <div className="mt-3 flex items-center gap-4">
              <a
                href="https://t.me/vanguard_urs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram VANGUARD"
                className="transition-opacity hover:opacity-80"
              >
                <IconTelegram className="size-[18px]" />
              </a>
              <a
                href="https://www.instagram.com/vanguard_urs/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram VANGUARD"
                className="transition-opacity hover:opacity-80"
              >
                <IconInstagram className="size-[18px]" />
              </a>
              <a
                href="https://www.tiktok.com/@vanguard_urs"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok VANGUARD"
                className="transition-opacity hover:opacity-80"
              >
                <IconTikTok className="size-[18px]" />
              </a>
            </div>
          </div>

          <span aria-hidden className="hidden w-px self-stretch bg-divider xl:block" />

          <div className="grid grid-cols-2 gap-7 sm:grid-cols-4 md:col-span-2 lg:gap-6 xl:col-span-1">
            <FooterCol
              heading="Продукція"
              links={[
                { label: "Детектори", href: "/catalog?category=detectors" },
                { label: "РЕБ системи", href: "/catalog?category=reb" },
                { label: "Антени", href: "/catalog?category=antennas" },
                { label: "Комплекти", href: "/catalog?category=kits" },
              ]}
            />
            <FooterCol
              heading="Компанія"
              links={[
                { label: "Про нас", href: "/about" },
                { label: "Виробництво", href: "/about" },
                { label: "Новини", href: "https://t.me/vanguard_urs" },
                { label: "Кар'єра", href: "mailto:vanguardltd25@gmail.com?subject=Вакансії%20VANGUARD" },
              ]}
            />
            <FooterCol
              heading="Підтримка"
              links={[
                { label: "Гарантія", href: "/warranty" },
                { label: "FAQ", href: "/faq" },
                { label: "Сервісні центри", href: "/contacts" },
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
            <h3 className="text-[10px] font-semibold uppercase leading-[14px] tracking-wide text-ink-2">
              Підписатися на новини
            </h3>
            <p className="mt-1.5 text-[10px] leading-4 text-ink-4">
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
                className="h-full w-full bg-transparent pl-3.5 text-[11px] text-ink placeholder:text-ink-5 focus:outline-none"
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

      <div className="mx-auto flex w-full max-w-[1536px] flex-col gap-2 px-5 py-3.5 text-[10px] leading-[14px] text-ink-5 sm:flex-row sm:items-center sm:justify-between lg:px-[67px]">
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
