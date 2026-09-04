import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ContactForm from "@/components/contacts/ContactForm";
import {
  IconChevronRight,
  IconFacebook,
  IconHome,
  IconInstagram,
  IconTelegram,
  IconYoutube,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Контакти — VANGUARD",
  description:
    "Звʼяжіться з VANGUARD: телефон, email, Telegram. Залиште заявку — менеджер допоможе з підбором обладнання для виявлення та протидії БПЛА.",
};

const CONTACTS: { label: string; value: string; href?: string }[] = [
  { label: "Телефон", value: "+38 (060) 840 35 20", href: "tel:+380608403520" },
  { label: "Email", value: "vanguardltd25@gmail.com", href: "mailto:vanguardltd25@gmail.com" },
  { label: "Telegram", value: "@VANGUARDSALE", href: "https://t.me/VANGUARDSALE" },
  { label: "Локація", value: "Україна" },
];

export default function ContactsPage() {
  return (
    <>
      <SiteHeader active="Контакти" />
      <main className="mx-auto w-full max-w-[1536px] flex-1 px-4 pb-6 lg:px-[67px]">
        <nav
          aria-label="Хлібні крихти"
          className="mt-3 flex items-center gap-2 text-[10px] leading-[14px]"
        >
          <IconHome className="size-3.5 text-ink-3" />
          <Link href="/" className="transition-colors hover:text-ink-2">
            Головна
          </Link>
          <IconChevronRight aria-hidden className="size-3.5 text-ink-3" />
          <span aria-current="page">Контакти</span>
        </nav>

        <div className="mt-4 max-w-[720px]">
          <h1 className="font-display text-[28px] font-bold uppercase leading-tight text-ink lg:text-[34px]">
            Контакти
          </h1>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
            Залиште заявку або звʼяжіться напряму — підкажемо конфігурацію під вашу задачу, терміни
            й супровід. Продажі ведемо через заявку, менеджер супроводжує до отримання.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:items-start">
          {/* Контактна інформація */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-[12px] border border-line-3 bg-surface p-5">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink">Прямий звʼязок</h2>
              <dl className="mt-4 space-y-3">
                {CONTACTS.map((c) => (
                  <div key={c.label} className="flex flex-col gap-0.5">
                    <dt className="text-[11px] uppercase tracking-wide text-ink-5">{c.label}</dt>
                    <dd className="text-[14px] text-ink-2">
                      {c.href ? (
                        <a href={c.href} className="transition-colors hover:text-accent">
                          {c.value}
                        </a>
                      ) : (
                        c.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 border-t border-line pt-4">
                <span className="text-[11px] uppercase tracking-wide text-ink-5">Ми в мережах</span>
                <div className="mt-2.5 flex items-center gap-4">
                  <a href="#" aria-label="Instagram"><IconInstagram className="size-[18px]" /></a>
                  <a href="#" aria-label="Facebook"><IconFacebook className="size-[18px]" /></a>
                  <a href="#" aria-label="YouTube"><IconYoutube className="size-[18px]" /></a>
                  <a href="#" aria-label="Telegram"><IconTelegram className="size-[18px]" /></a>
                </div>
              </div>
            </div>

            <div className="rounded-[12px] border border-line-3 bg-help p-5">
              <h3 className="text-[13px] font-semibold text-ink">Працюємо з підрозділами та організаціями</h3>
              <p className="mt-1.5 text-[11px] leading-4 text-ink-3">
                Для volume-замовлень і співпраці вкажіть підрозділ/організацію у формі — підготуємо
                умови окремо.
              </p>
            </div>
          </aside>

          {/* Форма заявки */}
          <section className="rounded-[12px] border border-card-line bg-card p-5 lg:p-6">
            <h2 className="font-display text-[18px] font-bold uppercase leading-tight text-ink">
              Залишити заявку
            </h2>
            <p className="mt-1 mb-5 text-[12px] text-ink-3">
              Заповніть форму — відповімо у зручний для вас спосіб.
            </p>
            <ContactForm />
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
