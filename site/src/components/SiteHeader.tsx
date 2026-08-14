import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import { IconSearch } from "./icons";

// Порядок пунктів — за Figma-макетом (фрейм Header / NAVIGATION)
const NAV = [
  { label: "Каталог", href: "/catalog" },
  { label: "Контакти", href: "#" },
  { label: "Рішення", href: "#" },
  { label: "Порівняння", href: "#" },
  { label: "Документація", href: "#" },
  { label: "Про компанію", href: "#" },
];

export default function SiteHeader({ active = "Каталог" }: { active?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line-3 bg-header/95 backdrop-blur">
      <div className="mx-auto flex h-[66px] w-full max-w-[1536px] items-center gap-3 px-4 lg:gap-6 lg:px-[35px]">
        <Link href="/catalog" aria-label="VANGUARD — на головну" className="shrink-0">
          <Image
            src="/images/brand/logo-full.png"
            alt="VANGUARD — Ukrainian Radioelectronic Systems"
            width={119}
            height={47}
            priority
          />
        </Link>

        <nav
          aria-label="Основна навігація"
          className="mx-auto hidden items-center gap-8 lg:flex xl:gap-[45px]"
        >
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={
                "text-[16px] font-medium leading-none transition-colors " +
                (item.label === active
                  ? "text-accent-deep"
                  : "text-ink-2 hover:text-ink")
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          className="ml-auto flex h-[39px] items-center gap-2.5 px-2.5 text-ink lg:ml-0"
          aria-label="Пошук"
        >
          <IconSearch className="size-4" />
          <span className="hidden text-[16px] font-medium sm:inline">Пошук</span>
        </button>

        <span aria-hidden className="hidden h-[33px] w-px bg-line-2 lg:block" />

        <Link
          href="#request"
          className="hidden h-9 shrink-0 items-center rounded-[3px] border border-accent-deep px-4 text-[14px] font-semibold text-[#F3F3F3] transition-colors hover:bg-accent-deep/15 sm:flex lg:px-6 lg:text-[16px]"
        >
          Зв&apos;язатися
        </Link>

        <MobileMenu items={NAV} active={active} />
      </div>
    </header>
  );
}
