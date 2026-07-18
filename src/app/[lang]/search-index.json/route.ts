import { LOCALES } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { buildSearchIndex } from "@/lib/search-index";

// Static like the editorial pages (Cache Components stays off, ADR 0005),
// refreshed hourly and on every editorial mutation via revalidate.ts.
export const dynamic = "force-static";
export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  return Response.json(await buildSearchIndex(parseLocale((await params).lang)));
}
