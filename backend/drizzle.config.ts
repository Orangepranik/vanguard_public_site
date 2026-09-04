import { defineConfig } from "drizzle-kit";

// Підвантажити backend/.env без залежностей (Node 20.12+/22+); drizzle-kit сам .env не читає.
try {
  process.loadEnvFile(".env");
} catch {
  /* .env може бути відсутнім — тоді беремо змінні з оточення */
}

export default defineConfig({
  schema: "./schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
});
