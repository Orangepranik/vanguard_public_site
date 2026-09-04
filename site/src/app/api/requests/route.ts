import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSql } from "@/lib/db";
import { notifyTelegram } from "@/lib/notify";

/**
 * POST /api/requests — єдиний динамічний ендпоінт сайту (docs/06-tech.md §28).
 * Заявка зберігається транзакційно у БД (таблиці requests + request_items, за контрактом DTO);
 * при збої БД — резерв у .data/requests.jsonl (заявка не має губитися ніколи). ERP читає ті самі таблиці.
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
  const organization = typeof body.organization === "string" ? body.organization.trim() : null;
  const comment = typeof body.comment === "string" ? body.comment.trim() : null;
  const sourcePage = typeof body.sourcePage === "string" ? body.sourcePage : null;
  const items = (Array.isArray(body.items) ? body.items : [])
    .map((it) => {
      const raw = it as Record<string, unknown>;
      return {
        slug: typeof raw.slug === "string" ? raw.slug.trim() : "",
        qty: typeof raw.qty === "number" && Number.isFinite(raw.qty) ? Math.floor(raw.qty) : 0,
        configuration:
          raw.configuration && typeof raw.configuration === "object"
            ? (raw.configuration as Record<string, string>)
            : undefined,
        sku: typeof raw.sku === "string" ? raw.sku : undefined,
        priceAtSubmit:
          typeof raw.priceAtSubmit === "number" && Number.isFinite(raw.priceAtSubmit)
            ? raw.priceAtSubmit
            : undefined,
      };
    })
    .filter((it) => it.slug.length > 0 && it.qty > 0);

  // Заявка = або товари (items), або загальне звернення з повідомленням (comment) зі сторінки «Контакти».
  const hasMessage = !!comment && comment.length >= 5;
  const errors: string[] = [];
  if (name.length < 2) errors.push("name");
  if (!PHONE_RE.test(phone)) errors.push("phone");
  if (items.length === 0 && !hasMessage) errors.push("comment");
  if (errors.length > 0) {
    return NextResponse.json({ error: "validation", fields: errors }, { status: 422 });
  }

  // Первинно — у БД (транзакція requests + request_items). Заявка не має губитися:
  // при збої БД пишемо резервний запис у чергу-файл .data/requests.jsonl (звірити з БД пізніше).
  try {
    const sql = getSql();
    const reqId = await sql.begin(async (tx) => {
      const [row] = await tx`
        INSERT INTO requests (name, phone, contact_channel, organization, comment, source_page)
        VALUES (${name}, ${phone}, ${contactChannel}, ${organization}, ${comment}, ${sourcePage})
        RETURNING id`;
      for (const it of items) {
        await tx`
          INSERT INTO request_items (request_id, product_slug, qty, configuration, sku, price_at_submit)
          VALUES (${row.id}, ${it.slug}, ${it.qty}, ${it.configuration ? sql.json(it.configuration) : null}, ${it.sku ?? null}, ${it.priceAtSubmit ?? null})`;
      }
      return row.id as string;
    });

    await notifyTelegram({ id: `REQ-${reqId}`, name, phone, contactChannel, organization, comment, items, sourcePage });
    return NextResponse.json({ ok: true, id: `REQ-${reqId}` });
  } catch (err) {
    console.error("[requests] INSERT у БД не вдався — резерв у .data/requests.jsonl:", err);
    const id = `REQ-${Date.now().toString(36).toUpperCase()}`;
    const record = { id, receivedAt: new Date().toISOString(), name, phone, contactChannel, organization, comment, items, sourcePage };
    try {
      const dir = path.join(process.cwd(), ".data"); // PII! .data/ у .gitignore
      await fs.mkdir(dir, { recursive: true });
      await fs.appendFile(path.join(dir, "requests.jsonl"), JSON.stringify(record) + "\n", "utf8");
    } catch (fsErr) {
      console.error("[requests] Резерв у JSONL теж не вдався:", fsErr);
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
    await notifyTelegram({ id, name, phone, contactChannel, organization, comment, items, sourcePage, fallback: true });
    return NextResponse.json({ ok: true, id, fallback: true });
  }
}
