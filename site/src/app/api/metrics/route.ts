import { metrics } from "@/lib/metrics";


export const dynamic = "force-dynamic";

export const runtime = "nodejs";

export async function GET() {
  const body = await metrics.register.metrics();
  return new Response(body, {
    headers: { "Content-Type": metrics.register.contentType },
  });
}