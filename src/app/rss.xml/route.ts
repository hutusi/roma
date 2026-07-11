import { buildFilmsFeed } from "@/lib/rss";

// Static like the editorial pages (Cache Components stays off, ADR 0005),
// refreshed hourly and on publish via revalidate.ts (revalidateFilm).
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const body = await buildFilmsFeed("zh");
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
