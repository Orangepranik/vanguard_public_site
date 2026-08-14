type IconProps = { className?: string };

export function IconSearch({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4.5 4.5" />
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9v12h13V9" />
    </svg>
  );
}

export function IconChevronRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="m9 5 7 7-7 7" />
    </svg>
  );
}

export function IconChevronDown({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="m5 9 7 7 7-7" />
    </svg>
  );
}

export function IconGrid({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      {[3, 9.75, 16.5].flatMap((y) =>
        [3, 9.75, 16.5].map((x) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="4.5" height="4.5" rx="1" />
        )),
      )}
    </svg>
  );
}

export function IconList({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" />
      <path d="M9 6h11M9 12h11M9 18h11" />
    </svg>
  );
}

export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className} aria-hidden>
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

export function IconReset({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M20 11a8 8 0 1 0-2.5 5.8" />
      <path d="M20 5v6h-6" />
    </svg>
  );
}

export function IconBurger({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function IconClose({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="m5 5 14 14M19 5 5 19" />
    </svg>
  );
}

export function IconArrowRight({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function IconBookmark({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden
    >
      <path d="M6 3h12v18l-6-4.5L6 21Z" strokeLinejoin="round" />
    </svg>
  );
}

/* Іконки смуги переваг (Figma catalog_page → Advantages) */

export function IconTrident({ className }: IconProps) {
  return (
    <svg viewBox="0 0 34 38" fill="none" stroke="#FFFFFF" strokeWidth="2.2" className={className} aria-hidden>
      <path d="M17 1.5 32 7v13.5c0 8.5-6.5 12.7-15 16-8.5-3.3-15-7.5-15-16V7Z" strokeLinejoin="round" />
      <path d="M17 8v17" />
      <path d="M11.5 10v6.5a5.5 5.5 0 0 0 11 0V10" />
      <path d="M13 25h8" />
    </svg>
  );
}

export function IconTarget({ className }: IconProps) {
  return (
    <svg viewBox="0 0 47 47" fill="none" stroke="#FFFFFF" strokeWidth="2.2" className={className} aria-hidden>
      <circle cx="23.5" cy="23.5" r="17.5" />
      <circle cx="23.5" cy="23.5" r="5" />
      <path d="M23.5 1v9M23.5 37v9M1 23.5h9M37 23.5h9" />
    </svg>
  );
}

/* Соцмережі футера (18px) */

export function IconInstagram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="17" height="17" rx="4.5" fill="#898F94" />
      <circle cx="9" cy="9" r="3.6" fill="none" stroke="#0F0F0F" strokeWidth="1.5" />
      <circle cx="13.6" cy="4.4" r="1.1" fill="#0F0F0F" />
    </svg>
  );
}

export function IconFacebook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden>
      <rect x="0.5" y="0.5" width="17" height="17" rx="8.5" fill="#898F94" />
      <path
        d="M10 15V9.8h1.8l.3-2H10V6.5c0-.6.2-1 1-1h1.1v-1.8C11.9 3.6 11.2 3.5 10.5 3.5c-1.7 0-2.8 1-2.8 2.8v1.5H6v2h1.7V15Z"
        fill="#0F0F0F"
      />
    </svg>
  );
}

export function IconYoutube({ className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden>
      <rect x="0.5" y="2.5" width="17" height="13" rx="3.5" fill="#898F94" />
      <path d="m7.5 6.2 4.6 2.8-4.6 2.8Z" fill="#0F0F0F" />
    </svg>
  );
}

export function IconTelegram({ className }: IconProps) {
  return (
    <svg viewBox="0 0 18 18" className={className} aria-hidden>
      <defs>
        <linearGradient id="tg-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#37BBFE" />
          <stop offset="1" stopColor="#007DBB" />
        </linearGradient>
      </defs>
      <circle cx="9" cy="9" r="8.5" fill="url(#tg-grad)" />
      <path
        d="m4 8.8 8.9-3.4c.4-.15.8.1.65.75l-1.5 7.1c-.1.5-.4.6-.85.35l-2.3-1.7-1.1 1.1c-.15.15-.3.25-.55.25l.2-2.4 4.3-3.9c.2-.15-.05-.25-.3-.1L6.1 10.2l-2.05-.65c-.45-.15-.45-.5.05-.75Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
