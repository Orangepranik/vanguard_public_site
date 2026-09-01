// Декодер .fig (Figma "fig-kiwi") → дерево вузлів.
// Формат: "fig-kiwi" | uint32 version | [ uint32 len | <стиснуті дані> ]...
//   блок 0 = kiwi-схема (вшита у файл), блок 1 = дані документа.
// Стиснення блоку визначаємо за магією: zstd (28 b5 2f fd) → fzstd, інакше raw deflate → zlib.
// ВАЖЛИВО: не викликати fzstd на не-zstd даних — невдалий виклик псує наступний результат fzstd.
//
// Вжиток:  node decode-fig.mjs <canvas.fig> [outDir]
// Дає:     <outDir>/canvas.decoded.json  (повне дерево)
//          <outDir>/canvas.outline.txt   (читабельний контур: тип/назва/текст/розмір/колір/зобр.)

import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import * as fzstd from "fzstd";
import { decodeBinarySchema, compileSchema } from "kiwi-schema";

const [, , figPath, outDirArg] = process.argv;
if (!figPath) {
  console.error("Вжиток: node decode-fig.mjs <canvas.fig> [outDir]");
  process.exit(1);
}
const outDir = outDirArg || path.dirname(path.resolve(figPath));
fs.mkdirSync(outDir, { recursive: true });

const buf = fs.readFileSync(figPath);
if (buf.subarray(0, 8).toString("latin1") !== "fig-kiwi") {
  throw new Error("Не fig-kiwi (перевір, що це canvas.fig, а не сам .fig-архів)");
}
const version = buf.readUInt32LE(8);

// розбір на блоки
const blocks = [];
let off = 12;
while (off + 4 <= buf.length) {
  const len = buf.readUInt32LE(off);
  off += 4;
  if (len === 0 || off + len > buf.length) break;
  blocks.push(buf.subarray(off, off + len));
  off += len;
}

const isZstd = (d) => d.length >= 4 && d[0] === 0x28 && d[1] === 0xb5 && d[2] === 0x2f && d[3] === 0xfd;
function decompress(data) {
  if (isZstd(data)) return Buffer.from(fzstd.decompress(new Uint8Array(data)));
  try { return zlib.inflateRawSync(data); } catch {}
  try { return zlib.inflateSync(data); } catch {}
  return Buffer.from(data); // лежить як є
}

const schema = decodeBinarySchema(decompress(blocks[0]));
const compiled = compileSchema(schema);
// kiwi-декодери використовують this.ByteBuffer → викликати як метод (не втрачати this)
const rootName = compiled.decodeMessage
  ? "decodeMessage"
  : Object.keys(compiled).find((k) => k.startsWith("decode") && /Message$/.test(k));
if (!rootName) throw new Error("У схемі немає кореневого декодера Message");

const message = compiled[rootName](decompress(blocks[1]));

console.log(`fig-kiwi v${version} · блоків: ${blocks.length} · типів: ${schema.definitions?.length ?? "?"} · вузлів: ${message.nodeChanges?.length ?? 0}`);

// --- JSON (байти → hex, bigint → рядок) ---
const jsonReplacer = (_k, v) => {
  if (v instanceof Uint8Array) return { __hex: Buffer.from(v).toString("hex") };
  if (typeof v === "bigint") return v.toString();
  return v;
};
fs.writeFileSync(path.join(outDir, "canvas.decoded.json"), JSON.stringify(message, jsonReplacer, 2));

// --- читабельний контур (дерево за parentIndex) ---
const gid = (g) => (g ? `${g.sessionID}:${g.localID}` : null);
const nodes = message.nodeChanges || [];
const byGuid = new Map(nodes.map((n) => [gid(n.guid), n]));
const childrenOf = new Map();
for (const n of nodes) {
  const p = gid(n.parentIndex?.guid);
  (childrenOf.get(p) ?? childrenOf.set(p, []).get(p)).push(n);
}
const byPos = (a, b) =>
  String(a.parentIndex?.position ?? "").localeCompare(String(b.parentIndex?.position ?? ""));
for (const arr of childrenOf.values()) arr.sort(byPos);

const hx = (n) => Math.round((n ?? 0) * 255).toString(16).padStart(2, "0");
const colorOf = (n) => {
  const p = (n.fillPaints || []).find((x) => x.type === "SOLID" && x.color);
  if (!p) return "";
  const a = p.color.a == null ? 1 : p.color.a;
  return ` fill=#${hx(p.color.r)}${hx(p.color.g)}${hx(p.color.b)}${a < 1 ? "/" + a.toFixed(2) : ""}`;
};
const imageOf = (n) => {
  const p = (n.fillPaints || []).find((x) => x.type === "IMAGE" && x.image?.hash);
  return p ? ` img=${Buffer.from(p.image.hash).toString("hex")}` : "";
};
const textOf = (n) => {
  const t = n.textData?.characters ?? n.characters;
  if (!t) return "";
  const s = String(t).replace(/\s+/g, " ").trim();
  return s ? ` text=${JSON.stringify(s.length > 160 ? s.slice(0, 160) + "…" : s)}` : "";
};
const sizeOf = (n) => (n.size ? ` ${Math.round(n.size.x)}×${Math.round(n.size.y)}` : "");

const lines = [];
const walk = (parentKey, depth) => {
  for (const n of childrenOf.get(parentKey) || []) {
    lines.push(
      `${"  ".repeat(depth)}[${n.type || "?"}] ${JSON.stringify(n.name || "")}` +
        `${sizeOf(n)}${colorOf(n)}${imageOf(n)}${textOf(n)}`
    );
    walk(gid(n.guid), depth + 1);
  }
};
const roots = nodes.filter((n) => !byGuid.has(gid(n.parentIndex?.guid))).sort(byPos);
for (const r of roots) {
  lines.push(`[${r.type || "?"}] ${JSON.stringify(r.name || "")}${sizeOf(r)}${colorOf(r)}${imageOf(r)}${textOf(r)}`);
  walk(gid(r.guid), 1);
}
fs.writeFileSync(path.join(outDir, "canvas.outline.txt"), lines.join("\n"));
console.log(`Готово → canvas.decoded.json + canvas.outline.txt (${lines.length} вузлів у контурі)`);
