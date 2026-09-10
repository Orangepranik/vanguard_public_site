import Image from "next/image";
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import SiteSearch from "./SiteSearch";
import ThemeToggle from "./ThemeToggle";
import { ContactTrigger } from "./contact/ContactDialog";

// Порядок пунктів — за Figma-макетом (фрейм Header / NAVIGATION); «Відгуки» — пропозиція (макета ще немає)
const NAV = [
  { label: "Головна", href: "/" },
  { label: "Каталог", href: "/catalog" },
  { label: "Рішення", href: "/solutions" },
  { label: "Відгуки", href: "/reviews" },
  { label: "Про компанію", href: "/about" },
  { label: "Контакти", href: "/contacts" },
];

export default function SiteHeader({ active = "Каталог" }: { active?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line-3 bg-header/95 backdrop-blur">
        <div className="mx-auto flex h-[66px] w-full max-w-[1536px] items-center gap-3 px-4 lg:px-[35px]">
          <div className="flex flex-1 items-center">
            <Link href="/catalog" aria-label="VANGUARD — на головну" className="shrink-0">
              <Image
                src="/images/brand/logo-full.png"
                alt="VANGUARD — Ukrainian Radioelectronic Systems"
                width={119}
                height={47}
                priority
                className="site-logo"
              />
            </Link>
          </div>

          <nav
            aria-label="Основна навігація"
            className="hidden items-center gap-6 xl:flex 2xl:gap-[38px]"
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

          <div className="flex flex-1 items-center justify-end gap-3 lg:gap-6">
            <SiteSearch className="flex h-[39px] items-center gap-2.5 px-2.5 text-ink transition-colors hover:text-accent-mid" />

            <ThemeToggle />

            <span aria-hidden className="hidden h-[33px] w-px bg-line-2 xl:block" />

            <ContactTrigger
              className="hidden h-9 shrink-0 items-center rounded-[3px] border border-accent-deep px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-accent-deep/15 sm:flex lg:px-6 lg:text-[16px]"
            >
              Зв&apos;язатися
            </ContactTrigger>

            <MobileMenu items={NAV} active={active} />
          </div>
        </div>
    </header>
  );
}
