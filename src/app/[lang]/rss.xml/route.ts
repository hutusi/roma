import { LOCALES } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { buildFilmsFeed } from "@/lib/rss";

// Static like the editorial pages (Cache Components stays off, ADR 0005),
// refreshed hourly and on publish via revalidate.ts (revalidateFilm).
export const dynamic = "force-static";
export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const body = await buildFilmsFeed(parseLocale((await params).lang));
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
