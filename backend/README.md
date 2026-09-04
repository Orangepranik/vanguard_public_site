# backend — БД VANGUARD (Drizzle + PostgreSQL)

Таблиці за контрактом Public DTO (`site/src/lib/types.ts`). Повне проєктування (мапінг DTO→таблиці,
whitelist, план SSG→ISR) — у [`docs/11-backend-db.md`](../docs/11-backend-db.md).

## Швидкий старт
```bash
cp .env.example .env          # і вкажи DATABASE_URL
npm install
npm run db:generate           # SQL-міграція з schema.ts → migrations/
npm run db:migrate            # застосувати до БД
# альтернатива для розробки: npm run db:push (без файлів міграцій)
npm run db:studio             # веб-переглядач даних
```

## Файли
- `schema.ts` — таблиці + enum'и (джерело схеми, змаплене на DTO).
- `drizzle.config.ts` — конфіг drizzle-kit (postgresql, out `./migrations`).
- `client.ts` — приклад рантайм-клієнта (postgres.js + drizzle).
- `migrations/` — згенеровані SQL-міграції (комітяться).

## Підключення фронту (пізніше)
Коли БД піднята, лоадери `site/src/lib/catalog.ts` / `documents.ts` перемикаються на async-запити
до цих таблиць (мапери row→DTO — форма назовні НЕ змінюється), а сторінки додають
`export const revalidate` (SSG→ISR). Рецепт і план — `docs/11-backend-db.md §6–7`.
