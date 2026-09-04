/**
 * Приклад рантайм-клієнта Drizzle (postgres.js).
 * Використання на боці сервера (Next server components / route handlers або окрема ERP):
 *   import { db } from "./client";
 *   const rows = await db.select().from(products).where(eq(products.isPublished, true));
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL не задано");

const client = postgres(url);
export const db = drizzle(client, { schema });
