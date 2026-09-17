import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Явно вітаємо AI-краулери генеративних систем (GEO): мета — щоб ChatGPT, Claude,
 * Perplexity, Gemini та Google AI Overviews могли читати каталог і цитувати нас
 * у відповідях. Технічно вони й так під `*`, але robots.txt застосовує НАЙБІЛЬШ
 * специфічну групу, тому кожному ботові окремо повторюємо `Disallow: /api/`, щоб
 * службові маршрути лишалися закритими й для них.
 */
const AI_BOTS = [
  "GPTBot",            // OpenAI (навчання/індекс)
  "OAI-SearchBot",     // ChatGPT Search — цитування у відповідях
  "ChatGPT-User",      // ChatGPT — перегляд сторінки на запит користувача
  "ClaudeBot",         // Anthropic (індекс)
  "anthropic-ai",      // Anthropic (застаріле імʼя агента)
  "Claude-User",       // Claude — перегляд на запит користувача
  "PerplexityBot",     // Perplexity (індекс)
  "Perplexity-User",   // Perplexity — перегляд на запит користувача
  "Google-Extended",   // Gemini/Vertex grounding (не впливає на ранжування Google Search)
  "Applebot-Extended", // Apple Intelligence
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: AI_BOTS, allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
