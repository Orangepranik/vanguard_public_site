import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * POST /api/revalidate — миттєве оновлення ISR-сторінок на вимогу.
 * ERP після зміни даних кличе цей роут → сторінки регенеруються при наступному запиті
 * (не чекаючи фонового `revalidate = 300`). Захист: заголовок x-revalidate-secret.
 * Тіло (необовʼязкове): { "scope": "products" | "documents" | "all" }.
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret || req.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let scope = "all";
  try {
    const body = (await req.json()) as { scope?: string };
    if (typeof body.scope === "string") scope = body.scope;
  } catch {
    /* тіло не обовʼязкове */
  }

  if (scope === "products" || scope === "all") {
    revalidatePath("/catalog");
    revalidatePath("/products/[slug]", "page");
  }
  if (scope === "documents" || scope === "all") {
    revalidatePath("/documentation");
  }

  return NextResponse.json({ revalidated: true, scope, at: Date.now() });
}
