import "server-only";
import postgres from "postgres";

// Ліниве підключення до PostgreSQL (лише сервер). DATABASE_URL — з оточення / site/.env.local.
// Кидаємо помилку при першому використанні, а не на імпорті, щоб не ламати збірку модулів без БД.
let client: ReturnType<typeof postgres> | undefined;

export function getSql() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL не задано (див. site/.env.local)");
    client = postgres(url, { max: 5 });
  }
  return client;
}
