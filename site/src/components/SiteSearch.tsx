"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowRight, IconClose, IconSearch } from "@/components/icons";

/* Пошук у топ-барі (пропозиція — макета нема). Кнопка відкриває модалку-палітру:
   індекс каталогу вантажиться один раз (/api/search), фільтр — миттєво на клієнті.
   Оверлей — портал у document.body (правило проєкту щодо fixed-оверлеїв). Ctrl/⌘+K. */

type SearchItem = {
  slug: string;
  name: string;
  shortName: string | null;
  typeLabel: string | null;
  category: string;
  tags: string[];
};

export default function SiteSearch({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Пошук" aria-haspopup="dialog" className={className}>
        <IconSearch className="size-4" />
        <span className="hidden text-[16px] font-medium sm:inline">Пошук</span>
      </button>
      {open && <SearchModal onClose={() => setOpen(false)} />}
    </>
  );
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<SearchItem[] | null>(null);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  // Індекс каталогу — один раз при відкритті
  useEffect(() => {
    let alive = true;
    fetch("/api/search")
      .then((r) => r.json())
      .then((d: { products?: SearchItem[] }) => alive && setItems(d.products ?? []))
      .catch(() => alive && setItems([]));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const query = q.trim().toLowerCase();
  const results = useMemo(() => {
    const list = items ?? [];
    if (!query) return list;
    return list.filter((it) =>
      [it.name, it.shortName, it.typeLabel, it.category, ...it.tags]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(query)),
    );
  }, [items, query]);

  const go = (slug: string) => {
    onClose();
    router.push(`/products/${slug}`);
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[90] flex justify-center overflow-y-auto p-4 py-[8vh]">
      <div aria-hidden onClick={onClose} className="fixed inset-0 bg-[#040506]/80 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Пошук по каталогу"
        className="relative z-10 h-fit w-full max-w-[560px] overflow-hidden rounded-[14px] border border-card-line bg-card shadow-[0_24px_70px_rgba(0,0,0,0.55)]"
      >
        <div className="flex items-center gap-3 border-b border-line-3 px-4">
          <IconSearch className="size-4 shrink-0 text-ink-3" />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && results[0]) go(results[0].slug);
            }}
            placeholder="Пошук по каталогу…"
            aria-label="Пошук по каталогу"
            className="h-14 flex-1 bg-transparent text-[15px] text-ink placeholder:text-ink-5 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрити"
            className="flex size-8 shrink-0 items-center justify-center rounded-[6px] text-ink-4 transition-colors hover:text-ink"
          >
            <IconClose className="size-5" />
          </button>
        </div>

        <div className="max-h-[56vh] overflow-y-auto p-2">
          {items === null ? (
            <p className="px-3 py-6 text-center text-[13px] text-ink-4">Завантаження…</p>
          ) : results.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-[13px] text-ink-2">Нічого не знайдено{query ? ` за «${q.trim()}»` : ""}.</p>
              <Link href="/catalog" onClick={onClose} className="mt-2 inline-block text-[12px] text-accent transition-colors hover:text-accent-mid">
                Переглянути весь каталог →
              </Link>
            </div>
          ) : (
            <ul>
              {results.map((it) => (
                <li key={it.slug}>
                  <Link
                    href={`/products/${it.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-[8px] px-3 py-2.5 transition-colors hover:bg-surface"
                  >
                    <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-[6px] border border-line-3 bg-field text-[8px] text-ink-5">
                      ФОТО
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">{it.shortName ?? it.name}</span>
                      <span className="block truncate text-[11px] text-ink-4">
                        {it.typeLabel ? `${it.typeLabel} · ` : ""}
                        {it.category}
                      </span>
                    </span>
                    <IconArrowRight className="size-4 shrink-0 text-ink-5" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-line-3 px-4 py-2 text-[10px] text-ink-5">
          <span>Enter — відкрити перший результат</span>
          <span>Esc — закрити</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
