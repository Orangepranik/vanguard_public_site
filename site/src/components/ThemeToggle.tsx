"use client";

import { useEffect, useState } from "react";

/* Перемикач теми: світла (за замовчуванням) ↔ темна.
   Початкова тема виставляється інлайн-скриптом у layout (до промальовки — без блимання),
   тут лише синхронізуємось із DOM і перемикаємо data-theme + localStorage. */

function applyTheme(dark: boolean) {
  const root = document.documentElement;
  root.classList.add("theme-switching"); // глушимо transition на мить фліпу
  if (dark) root.setAttribute("data-theme", "dark");
  else root.removeAttribute("data-theme");
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    /* приватний режим / заблокований storage — просто ігноруємо */
  }
  window.requestAnimationFrame(() =>
    window.requestAnimationFrame(() => root.classList.remove("theme-switching")),
  );
}

export default function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  const toggle = () => {
    setDark((prev) => {
      const next = !prev;
      applyTheme(next);
      return next;
    });
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
      aria-pressed={dark}
      title={dark ? "Світла тема" : "Темна тема"}
      className={
        className ??
        "flex size-9 items-center justify-center rounded-[6px] border border-edge text-ink-3 transition-colors hover:border-accent hover:text-ink"
      }
    >
      {/* до монтування іконку не показуємо, щоб уникнути розбіжності SSR/клієнта */}
      {mounted &&
        (dark ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-[18px]" aria-hidden>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-[18px]" aria-hidden>
            <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" strokeLinejoin="round" />
          </svg>
        ))}
    </button>
  );
}
