import type { NextConfig } from "next";

// Заголовки безпеки — лише у ПРОДАКШНІ. CSP — головний бекстоп проти XSS: блокує
// зовнішні скрипти/фрейми/форми, base-hijack і object-embed. Скрипти/стилі в
// застосунку інлайняться (Next-гідрація, themeInit, Tailwind), тож потрібен
// 'unsafe-inline'; eval у проді не використовується. Шрифти самохостяться
// (next/font/google) → 'self'; зовнішніх джерел немає. У dev headers НЕ ставимо:
// nosniff ламає dev-only маніфести Next, а CSP заважає Turbopack HMR (ws/eval).
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "script-src 'self' 'unsafe-inline'",
  "connect-src 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Самодостатній артефакт для Docker (тягне лише потрібні файли у .next/standalone).
  output: "standalone",
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
