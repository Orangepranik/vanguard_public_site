import type { Availability, PublicPrice } from "./types";

export function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function formatPrice(p: PublicPrice): string {
  if (p.type === "on_request") return "Ціна за запитом";
  return (p.type === "from" ? "від " : "") + formatNumber(p.amount) + " грн";
}

export function productsPlural(n: number): string {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return `${n} продукт`;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return `${n} продукти`;
  return `${n} продуктів`;
}

export function availabilityClass(a: Availability): string {
  switch (a) {
    case "in_stock":
      return "text-ok";
    case "production_3_5d":
    case "on_order":
      return "text-warn";
    case "temporarily_unavailable":
      return "text-bad";
    case "check_with_manager":
      return "text-ink-4";
  }
}
