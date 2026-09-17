import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSql } from "@/lib/db";
import { notifyTelegram } from "@/lib/notify";
import { metrics } from "@/lib/metrics";

/**
 * POST /api/requests — єдиний динамічний ендпоінт сайту (docs/06-tech.md §28).
 * Заявка зберігається транзакційно у БД (таблиці requests + request_items, за контрактом DTO);
 * при збої БД — резерв у .data/requests.jsonl (заявка не має губитися ніколи). ERP читає ті самі таблиці.
 */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;
const MAX_BODY_BYTES = 16 * 1024; // тіло заявки — до 16 КБ (захист від роздування пам'яті)
const hits = new Map<string, number[]>();
let lastSweep = Date.now();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  // Періодичне прибирання, щоб Map не ріс безмежно (пам'ять/DoS через розмаїття IP).
  if (now - lastSweep > WINDOW_MS) {
    for (const [k, ts] of hits) {
      if (ts.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
    lastSweep = now;
  }
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

// Довірена IP клієнта: за Cloudflare+Caddy ПЕРШИЙ X-Forwarded-For підробляється
// клієнтом (проксі лише дописує реальний у кінець), тож брати його для rate-limit
// небезпечно. Пріоритет: CF-Connecting-IP (ставить Cloudflare) → X-Real-IP (Caddy) →
// як резерв перший XFF.
function clientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip")?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    (req.headers.get("x-forwarded-for") ?? "local").split(",")[0].trim()
  );
}

// Обрізаємо рядки до безпечної довжини (сховище/пам'ять/ліміт повідомлення Telegram 4096).
const clamp = (s: string, max: number): string => (s.length > max ? s.slice(0, max) : s);
const MAX = { name: 120, phone: 32, organization: 200, comment: 4000, sku: 64 };

const PHONE_RE = /^\+?[\d\s()-]{9,18}$/;
const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,79}$/; // формат slug продукту (лишається bind-параметром у SQL)
const CHANNELS = new Set(["call", "telegram", "signal", "whatsapp"]);

// sourcePage — приймаємо ЛИШЕ власний відносний шлях («/catalog»); чужі та
// протокол-відносні URL («//evil», «http://…») відкидаємо (захист у глибину від
// зберігання сміття й майбутнього open-redirect, якщо значення колись стане ціллю переходу).
function safeSourcePage(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s.startsWith("/") || s.startsWith("//")) return null;
  return clamp(s, 512);
}

// Конфігурація варіанта — довільний об'єкт від клієнта. Лишаємо тільки пари
// рядок→рядок з обмеженням кількості/довжини (у SQL іде як bind JSON, але не даємо
// роздувати сховище).
function sanitizeConfig(v: unknown): Record<string, string> | undefined {
  if (!v || typeof v !== "object" || Array.isArray(v)) return undefined;
  const out: Record<string, string> = {};
  let n = 0;
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (n >= 20) break;
    if (typeof val === "string") {
      out[clamp(k, 64)] = clamp(val, 128);
      n++;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

export async function POST(req: Request) {
  // Обгортка-таймер: заміряємо тривалість усієї обробки (Histogram → p95/p99 + алерт «повільний відгук»).
  // Обгортаємо, а не дьоргаємо таймер перед кожним return — так меншає шансів забути гілку.
  const end = metrics.httpDuration.startTimer({ route: "/api/requests", method: "POST" });
  const res = await handleRequest(req);
  end({ status: String(res.status) });
  return res;
}

async function handleRequest(req: Request) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    metrics.requestsTotal.inc({ outcome: "rate_limited" });
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  // Відкидаємо завелике тіло ще до парсингу (захист від роздування пам'яті).
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    metrics.requestsTotal.inc({ outcome: "validation" });
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    metrics.requestsTotal.inc({ outcome: "invalid_json" });
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Honeypot: приховане поле "website" завжди порожнє в людей (без CAPTCHA — docs/04-logic §21)
  if (typeof body.website === "string" && body.website.length > 0) {
    metrics.requestsTotal.inc({ outcome: "honeypot" }); // бот спіймався на приховане поле; поміняй на "ok", якщо не хочеш рахувати окремо
    return NextResponse.json({ ok: true, id: "REQ-OK" });
  }

  const name = clamp(typeof body.name === "string" ? body.name.trim() : "", MAX.name);
  const phone = clamp(typeof body.phone === "string" ? body.phone.trim() : "", MAX.phone);
  const contactChannel =
    typeof body.contactChannel === "string" && CHANNELS.has(body.contactChannel)
      ? body.contactChannel
      : "call";
  const organization =
    typeof body.organization === "string" && body.organization.trim()
      ? clamp(body.organization.trim(), MAX.organization)
      : null;
  const comment =
    typeof body.comment === "string" && body.comment.trim()
      ? clamp(body.comment.trim(), MAX.comment)
      : null;
  const sourcePage = safeSourcePage(body.sourcePage);
  const items = (Array.isArray(body.items) ? body.items : [])
    .map((it) => {
      const raw = it as Record<string, unknown>;
      const slug = typeof raw.slug === "string" ? raw.slug.trim() : "";
      return {
        slug: SLUG_RE.test(slug) ? slug : "",
        qty:
          typeof raw.qty === "number" && Number.isFinite(raw.qty)
            ? Math.min(Math.floor(raw.qty), 9999)
            : 0,
        configuration: sanitizeConfig(raw.configuration),
        sku: typeof raw.sku === "string" ? clamp(raw.sku, MAX.sku) : undefined,
        priceAtSubmit:
          typeof raw.priceAtSubmit === "number" && Number.isFinite(raw.priceAtSubmit)
            ? raw.priceAtSubmit
            : undefined,
      };
    })
    .filter((it) => it.slug.length > 0 && it.qty > 0)
    .slice(0, 50); // не більше 50 позицій у заявці

  // Заявка = або товари (items), або загальне звернення з повідомленням (comment) зі сторінки «Контакти».
  const hasMessage = !!comment && comment.length >= 5;
  const errors: string[] = [];
  if (name.length < 2) errors.push("name");
  if (!PHONE_RE.test(phone)) errors.push("phone");
  if (items.length === 0 && !hasMessage) errors.push("comment");
  if (errors.length > 0) {
    metrics.requestsTotal.inc({ outcome: "validation" });
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
    metrics.requestsTotal.inc({ outcome: "ok" });
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
      metrics.requestsTotal.inc({ outcome: "error" });
      return NextResponse.json({ error: "server_error" }, { status: 500 });
    }
    await notifyTelegram({ id, name, phone, contactChannel, organization, comment, items, sourcePage, fallback: true });
    metrics.requestsTotal.inc({ outcome: "fallback" }); // БД лягла, врятувалися файлом — сюди повісимо алерт на Етапі 4
    return NextResponse.json({ ok: true, id, fallback: true });
  }
}
