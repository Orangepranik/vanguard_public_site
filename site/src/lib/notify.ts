import "server-only";

/**
 * Best-effort сповіщення менеджера в Telegram про нову заявку.
 * Вмикається, коли задано env TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID (site/.env.local).
 * Ніколи не кидає помилку — заявка вже збережена, сповіщення не має ламати відповідь.
 */

type NotifyItem = { slug: string; qty: number; sku?: string };

export type NotifyInput = {
  id: string;
  name: string;
  phone: string;
  contactChannel: string;
  organization: string | null;
  comment: string | null;
  items: NotifyItem[];
  sourcePage: string | null;
  fallback?: boolean;
};

const CHANNEL_LABEL: Record<string, string> = {
  call: "Дзвінок",
  telegram: "Telegram",
  signal: "Signal",
  whatsapp: "WhatsApp",
};

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function notifyTelegram(r: NotifyInput): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return; // сповіщення вимкнено, поки не налаштовано chat_id

  const lines = [
    `🔔 <b>Нова заявка</b> ${esc(r.id)}${r.fallback ? " ⚠️ (резерв — БД недоступна)" : ""}`,
    `👤 ${esc(r.name)}`,
    `📞 ${esc(r.phone)} · ${esc(CHANNEL_LABEL[r.contactChannel] ?? r.contactChannel)}`,
  ];
  if (r.organization) lines.push(`🏢 ${esc(r.organization)}`);
  if (r.items.length > 0) {
    lines.push(`📦 ${esc(r.items.map((it) => `${it.slug} ×${it.qty}`).join(", "))}`);
  }
  if (r.comment) lines.push(`💬 ${esc(r.comment)}`);
  if (r.sourcePage) lines.push(`🌐 ${esc(r.sourcePage)}`);

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: lines.join("\n"),
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("[notify] Telegram HTTP", res.status, await res.text().catch(() => ""));
    }
  } catch (e) {
    console.error("[notify] Telegram помилка:", e);
  }
}
