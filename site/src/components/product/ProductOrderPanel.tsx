"use client";

import { useId, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { Availability, Configuration, PublicPrice, Variant } from "@/lib/types";
import { AVAILABILITY_LABELS } from "@/lib/types";
import { availabilityClass, formatAmount, formatPrice } from "@/lib/format";
import { IconArrowRight, IconCheck } from "@/components/icons";

/* Панель ціни/наявності + конфігуратор варіантів + форма замовлення (→ POST /api/requests).
   Клієнтський компонент. Сторінка продукту — пропозиція в наявній дизайн-мові (макета ще немає). */

type Props = {
  slug: string;
  name: string;
  configuration?: Configuration;
  publicPrice: PublicPrice;
  availability: Availability;
};

const CHANNELS = [
  { value: "call", label: "Дзвінок" },
  { value: "telegram", label: "Telegram" },
  { value: "signal", label: "Signal" },
  { value: "whatsapp", label: "WhatsApp" },
];
const PHONE_RE = /^\+?[\d\s()-]{9,18}$/;

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "ok"; id: string }
  | { kind: "error"; message: string };

function resolveVariant(cfg: Configuration, sel: Record<string, string>): Variant | undefined {
  return cfg.variants.find((v) => Object.entries(v.options).every(([g, o]) => sel[g] === o));
}

export default function ProductOrderPanel({ slug, name, configuration, publicPrice, availability }: Props) {
  const uid = useId();
  const [selection, setSelection] = useState<Record<string, string>>(() => {
    if (!configuration) return {};
    const def = configuration.variants.find((v) => v.id === configuration.defaultVariantId);
    return def ? { ...def.options } : {};
  });
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [invalid, setInvalid] = useState<Set<string>>(new Set());

  const variant = useMemo(
    () => (configuration ? resolveVariant(configuration, selection) : undefined),
    [configuration, selection],
  );
  const price: PublicPrice = variant
    ? { type: "exact", amount: variant.price, currency: "UAH" }
    : publicPrice;
  const avail: Availability = variant?.availability ?? availability;

  const pick = (groupId: string, optionId: string) =>
    setSelection((s) => ({ ...s, [groupId]: optionId }));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      contactChannel: String(fd.get("contactChannel") ?? "call"),
      comment: String(fd.get("comment") ?? "").trim() || undefined,
      website: String(fd.get("website") ?? ""),
      sourcePage: `/products/${slug}`,
      items: [
        {
          slug,
          qty,
          configuration: configuration ? selection : undefined,
          sku: variant?.sku,
          priceAtSubmit: variant?.price ?? (publicPrice.type !== "on_request" ? publicPrice.amount : undefined),
        },
      ],
    };
    const bad = new Set<string>();
    if (payload.name.length < 2) bad.add("name");
    if (!PHONE_RE.test(payload.phone)) bad.add("phone");
    setInvalid(bad);
    if (bad.size > 0) {
      setStatus({ kind: "error", message: "Перевірте виділені поля." });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; id?: string; fields?: string[] };
      if (res.ok && data.ok) {
        setStatus({ kind: "ok", id: data.id ?? "REQ" });
        form.reset();
      } else if (res.status === 422) {
        setInvalid(new Set(data.fields ?? []));
        setStatus({ kind: "error", message: "Перевірте виділені поля." });
      } else if (res.status === 429) {
        setStatus({ kind: "error", message: "Забагато спроб. Спробуйте за хвилину." });
      } else {
        setStatus({ kind: "error", message: "Не вдалося надіслати. Спробуйте ще раз." });
      }
    } catch {
      setStatus({ kind: "error", message: "Немає звʼязку із сервером." });
    }
  }

  const border = (f: string) => (invalid.has(f) ? "border-bad" : "border-edge");
  const field =
    "w-full rounded-[6px] border bg-field px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-5 focus:outline-none focus-visible:border-accent";

  return (
    <div className="rounded-[12px] border border-card-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span className="font-display text-[26px] font-bold leading-none text-ink">{formatPrice(price)}</span>
            {price.type === "exact" && price.oldAmount != null && price.oldAmount > price.amount && (
              <s className="text-[15px] font-medium text-ink-5">{formatAmount(price.oldAmount)}</s>
            )}
          </div>
          <div className={"mt-2 flex items-center gap-1.5 text-[12px] font-medium " + availabilityClass(avail)}>
            <span aria-hidden className="size-1.5 rounded-full bg-current" />
            {AVAILABILITY_LABELS[avail]}
          </div>
        </div>
        {variant && (
          <div className="text-right text-[11px] leading-tight text-ink-5">
            Артикул
            <div className="mt-0.5 text-ink-3">{variant.sku}</div>
          </div>
        )}
      </div>

      {configuration && (
        <div className="mt-5 space-y-4 border-t border-line pt-4">
          {configuration.optionGroups.map((g) => (
            <div key={g.id}>
              <div className="text-[12px] text-ink-3">{g.label}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {g.options.map((o) => {
                  const active = selection[g.id] === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => pick(g.id, o.id)}
                      aria-pressed={active}
                      className={
                        "rounded-[6px] border px-3 py-1.5 text-[12px] transition-colors " +
                        (active
                          ? "border-accent-deep bg-accent-deep/15 text-ink"
                          : "border-edge text-ink-2 hover:border-accent")
                      }
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <div className="flex h-11 items-center rounded-[8px] border border-edge">
          <button type="button" aria-label="Менше" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-full w-10 items-center justify-center text-ink-2 hover:text-ink">−</button>
          <span className="w-8 text-center text-[14px] text-ink" aria-live="polite">{qty}</span>
          <button type="button" aria-label="Більше" onClick={() => setQty((q) => Math.min(99, q + 1))} className="flex h-full w-10 items-center justify-center text-ink-2 hover:text-ink">+</button>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[8px] bg-submit px-5 text-[14px] font-semibold text-white transition-colors hover:bg-accent-mid"
        >
          Залишити заявку
          <IconArrowRight className="size-4" />
        </button>
      </div>

      {status.kind === "ok" ? (
        <div className="mt-4 flex items-start gap-2.5 rounded-[8px] border border-ok/40 bg-ok/10 p-3.5">
          <IconCheck className="mt-0.5 size-4 shrink-0 text-ok" />
          <p className="text-[12px] leading-relaxed text-ink-2">
            Заявку <b>{status.id}</b> прийнято. Менеджер звʼяжеться щодо «{name}».
          </p>
        </div>
      ) : (
        open && (
          <form onSubmit={submit} noValidate className="mt-4 flex flex-col gap-3 border-t border-line pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input name="name" type="text" autoComplete="name" placeholder="Імʼя або позивний *" className={`${field} ${border("name")}`} />
              <input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="Телефон *" className={`${field} ${border("phone")}`} />
            </div>
            <div className="relative">
              <select name="contactChannel" defaultValue="call" aria-label="Звʼязок через" className={`${field} border-edge appearance-none pr-9`}>
                {CHANNELS.map((c) => <option key={c.value} value={c.value}>Звʼязок: {c.label}</option>)}
              </select>
              <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m5 9 7 7 7-7" /></svg>
            </div>
            <textarea name="comment" rows={2} placeholder="Коментар (за бажанням)" className={`${field} border-edge resize-y`} />
            <div aria-hidden className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden">
              <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
            </div>
            {status.kind === "error" && <p role="alert" className="text-[12px] text-bad">{status.message}</p>}
            <button
              type="submit"
              disabled={status.kind === "sending"}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-accent-deep text-[14px] font-semibold text-ink transition-colors hover:bg-accent-deep/15 disabled:opacity-60"
            >
              {status.kind === "sending" ? "Надсилаємо…" : "Надіслати заявку"}
            </button>
            <p className="text-[11px] leading-4 text-ink-5">Продаж — через заявку; менеджер супроводжує до отримання.</p>
          </form>
        )
      )}
    </div>
  );
}
