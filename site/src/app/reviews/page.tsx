import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ReviewsFeed from "@/components/reviews/ReviewsFeed";
import { IconChevronRight, IconHome } from "@/components/icons";
import { getAllReviews } from "@/lib/reviews";

export const revalidate = 300; // ISR: фонове оновлення раз на 5 хв

export const metadata: Metadata = {
  title: "Відгуки — VANGUARD",
  description:
    "Відгуки та досвід застосування обладнання VANGUARD — детекторів, засобів РЕБ і спостереження. Реальні історії з фото й відео, фільтр за продуктом.",
  alternates: { canonical: "/reviews" },
};

export default async function ReviewsPage() {
  const reviews = await getAllReviews();

  return (
    <>
      <SiteHeader active="Відгуки" />
      <main className="mx-auto w-full max-w-[1536px] flex-1 px-4 pb-16 lg:px-[67px]">
        <nav aria-label="Хлібні крихти" className="mt-3 flex items-center gap-2 text-[10px] leading-[14px]">
          <IconHome className="size-3.5 text-ink-3" />
          <Link href="/" className="transition-colors hover:text-ink-2">Головна</Link>
          <IconChevronRight aria-hidden className="size-3.5 text-ink-3" />
          <span aria-current="page" className="text-ink-2">Відгуки</span>
        </nav>

        <header className="mt-5 max-w-[720px]">
          <h1 className="font-display text-[26px] font-bold uppercase leading-tight text-ink lg:text-[32px]">
            Відгуки та досвід застосування
          </h1>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-3 lg:text-[14px]">
            Реальні історії застосування обладнання VANGUARD від операторів, командирів і підрозділів.
            Гортайте стрічку донизу, фільтруйте за продуктом або дивіться лише відгуки з фото та відео.
          </p>
        </header>

        <div className="mt-7">
          <ReviewsFeed reviews={reviews} />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
