"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { IconArrowRight, IconCheck } from "@/components/icons";

/* Форма звернення сторінки «Контакти» → POST /api/requests → БД (requests).
   Пропозиція в наявній дизайн-мові (макета для цієї сторінки ще немає). */

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

export default function ContactForm() {
  const uid = useId();
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [invalid, setInvalid] = useState<Set<string>>(new Set());

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      organization: String(fd.get("organization") ?? "").trim() || undefined,
      contactChannel: String(fd.get("contactChannel") ?? "call"),
      comment: String(fd.get("comment") ?? "").trim(),
      website: String(fd.get("website") ?? ""), // honeypot
      sourcePage: "/contacts",
      items: [],
    };

    const bad = new Set<string>();
    if (payload.name.length < 2) bad.add("name");
    if (!PHONE_RE.test(payload.phone)) bad.add("phone");
    if (payload.comment.length < 5) bad.add("comment");
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
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        id?: string;
        fields?: string[];
      };
      if (res.ok && data.ok) {
        setStatus({ kind: "ok", id: data.id ?? "REQ" });
        form.reset();
        setInvalid(new Set());
      } else if (res.status === 422) {
        setInvalid(new Set(data.fields ?? []));
        setStatus({ kind: "error", message: "Перевірте виділені поля." });
      } else if (res.status === 429) {
        setStatus({ kind: "error", message: "Забагато спроб. Спробуйте за хвилину." });
      } else {
        setStatus({ kind: "error", message: "Не вдалося надіслати. Спробуйте ще раз." });
      }
    } catch {
      setStatus({ kind: "error", message: "Немає звʼязку із сервером. Спробуйте ще раз." });
    }
  }

  if (status.kind === "ok") {
    return (
      <div className="flex flex-col items-center rounded-[12px] border border-card-line bg-card p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-ok/15 text-ok">
          <IconCheck className="size-6" />
        </span>
        <h3 className="mt-4 font-display text-[18px] font-bold uppercase text-ink">Заявку прийнято</h3>
        <p className="mt-2 max-w-[320px] text-[13px] leading-relaxed text-ink-3">
          Номер звернення <b className="text-ink-2">{status.id}</b>. Менеджер звʼяжеться з вами найближчим часом.
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-5 rounded-[6px] border border-edge px-4 py-2 text-[13px] text-ink-2 transition-colors hover:border-accent hover:text-ink"
        >
          Надіслати ще одну
        </button>
      </div>
    );
  }

  const sending = status.kind === "sending";
  const border = (f: string) => (invalid.has(f) ? "border-bad" : "border-edge");
  const field =
    "w-full rounded-[6px] border bg-field px-3 py-2.5 text-[13px] text-ink placeholder:text-ink-5 transition-colors focus:outline-none focus-visible:border-accent";

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-ink-3">Імʼя або позивний *</span>
          <input name="name" type="text" autoComplete="name" placeholder="Як до вас звертатися" className={`${field} ${border("name")}`} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-ink-3">Телефон *</span>
          <input name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="+38 (0__) ___ __ __" className={`${field} ${border("phone")}`} />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-ink-3">Підрозділ / організація</span>
          <input name="organization" type="text" placeholder="За бажанням" className={`${field} ${border("organization")}`} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[12px] text-ink-3">Звʼязок через</span>
          <div className="relative">
            <select name="contactChannel" defaultValue="call" className={`${field} border-edge appearance-none pr-9`}>
              {CHANNELS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m5 9 7 7 7-7" />
            </svg>
          </div>
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-[12px] text-ink-3">Повідомлення *</span>
        <textarea name="comment" rows={4} placeholder="Опишіть задачу, потрібне обладнання чи запитання" className={`${field} ${border("comment")} resize-y`} />
      </label>

      {/* Honeypot проти ботів — приховане поле, люди його не заповнюють */}
      <div aria-hidden className="pointer-events-none absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-website`}>Не заповнювати</label>
        <input id={`${uid}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status.kind === "error" && (
        <p role="alert" className="text-[12px] text-bad">{status.message}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-[46px] items-center gap-2 rounded-[8px] bg-submit px-6 text-[14px] font-semibold text-white transition-colors hover:bg-accent-mid disabled:opacity-60"
        >
          {sending ? "Надсилаємо…" : "Надіслати заявку"}
          {!sending && <IconArrowRight className="size-4" />}
        </button>
        <p className="text-[11px] leading-4 text-ink-5">
          Надсилаючи, ви погоджуєтесь на обробку контактних даних для звʼязку.
        </p>
      </div>
    </form>
  );
}
