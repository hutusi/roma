/**
 * IndexNow key file. The spec's default location is /{key}.txt, but a
 * root [key] segment would collide with the [lang] tree ("different
 * slug names for the same dynamic path"), so pings sent by
 * src/lib/indexnow.ts carry keyLocation pointing here instead — the
 * spec allows any same-host URL whose body is the key.
 */
export function GET() {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return new Response("Not Found", { status: 404 });
  return new Response(key, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      // The key only changes with a redeploy; spare the route from
      // engines re-fetching it on every submission.
      "Cache-Control": "public, max-age=86400",
    },
  });
}
