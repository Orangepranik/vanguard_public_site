# tools/fig — розбір .fig-макетів

Джерело правди для UI — `.fig`-файли власника в `assets/design/`. Цей інструмент
перетворює `.fig` на дерево вузлів (тексти, стилі, розміри, посилання на зображення),
щоб верстати сторінки точно за макетом.

## Формат .fig (коротко)

- `.fig` — це **zip**. Усередині: `canvas.fig`, тека `images/` (вбудовані зображення
  за hash-іменами), `meta.json`, `thumbnail.png`.
- `canvas.fig` — `fig-kiwi`: `"fig-kiwi"` | `uint32 version` | блоки (`uint32 len` + дані).
  Блок 0 — **kiwi-схема** (raw deflate), блок 1 — **дані** документа (zstd).
  Метод стиснення визначається за магією байтів автоматично.

## Використання

```bash
# 1) розпакувати .fig (це zip) — напр. у тимчасову теку:
#    у PowerShell: Expand-Archive або System.IO.Compression
# 2) декодувати canvas.fig:
cd tools/fig && npm install
npm run decode -- <шлях>/canvas.fig <вихідна-тека>
```

Результат:
- `canvas.decoded.json` — повне дерево вузлів (`nodeChanges`), байти → hex.
- `canvas.outline.txt` — читабельний контур: `[TYPE] "назва" розмір fill=#.. img=<hash> text=".."`.

Зображення беруться прямо з `images/<hash>` у zip (усі PNG); імена вузлів у контурі
показують, який `img=<hash>` куди йде.
