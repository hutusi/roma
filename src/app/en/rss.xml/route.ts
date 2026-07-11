import { buildFilmsFeed } from "@/lib/rss";

// See (zh) /rss.xml — the en feed over the en-published subset.
export const dynamic = "force-static";
export const revalidate = 3600;

export async function GET() {
  const body = await buildFilmsFeed("en");
  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
