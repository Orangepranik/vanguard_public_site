import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * POST /api/requests — єдиний динамічний ендпоінт сайту (docs/06-tech.md §28).
 * Рішення Q5: на старті заявки зберігаються в черзі на боці сайту (.data/requests.jsonl)
 * + сповіщення менеджерам; самописна ERP підключиться до цієї черги пізніше.
 * Заявка не має губитися ніколи.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

const PHONE_RE = /^\+?[\d\s()-]{9,18}$/;
const CHANNELS = new Set(["call", "telegram", "signal", "whatsapp"]);

export async function POST(req: Request) {
  const ip = (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: приховане поле "website" завжди порожнє в людей (без CAPTCHA — docs/04-logic §21)
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true, id: "REQ-OK" });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const contactChannel =
    typeof body.contactChannel === "string" && CHANNELS.has(body.contactChannel)
      ? body.contactChannel
      : "call";
  const items = Array.isArray(body.items) ? body.items : [];

  const errors: string[] = [];
  if (name.length < 2) errors.push("name");
  if (!PHONE_RE.test(phone)) errors.push("phone");
  if (items.length === 0) errors.push("items");
  if (errors.length > 0) {
    return NextResponse.json({ error: "validation", fields: errors }, { status: 422 });
  }

  const id = `REQ-${Date.now().toString(36).toUpperCase()}`;
  const record = {
    id,
    receivedAt: new Date().toISOString(),
    name,
    phone,
    contactChannel,
    organization: typeof body.organization === "string" ? body.organization.trim() : null,
    comment: typeof body.comment === "string" ? body.comment.trim() : null,
    items,
    sourcePage: typeof body.sourcePage === "string" ? body.sourcePage : null,
  };

  // Черга заявок (PII! .data/ у .gitignore; доступ і retention — docs/08-roadmap ризик №2)
  const dir = path.join(process.cwd(), ".data");
  await fs.mkdir(dir, { recursive: true });
  await fs.appendFile(path.join(dir, "requests.jsonl"), JSON.stringify(record) + "\n", "utf8");

  // TODO: сповіщення менеджерів — email + Telegram-бот
  // (env: NOTIFY_EMAIL, TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID; підключається перед релізом)

  return NextResponse.json({ ok: true, id });
}
