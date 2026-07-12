import "server-only";
import { after } from "next/server";
import { LOCALES, localePath } from "@/i18n/locales";
import { SITE_URL } from "@/lib/site";

const ENDPOINT = "https://api.indexnow.org/indexnow";

/**
 * Notify IndexNow-federated engines (Bing et al.) that pages changed.
 * Called from the revalidate helpers, i.e. only inside server actions —
 * which is what makes `after()` legal here: the ping leaves the
 * request's critical path, and publish latency doesn't pay for it.
 *
 * No-op without INDEXNOW_KEY (local/preview/e2e). Both locales are
 * pinged unconditionally, mirroring revalidate.ts: one row holds both
 * editions and a ping for an en stub is harmless. Failures are
 * swallowed — a publish must never fail because a search engine burped.
 * The key is served by src/app/indexnow-key.txt/route.ts; keyLocation
 * points engines at it (the spec allows any same-host URL).
 */
export function pingIndexNow(paths: string[]): void {
  const key = process.env.INDEXNOW_KEY;
  if (!key) return;
  const urlList = paths.flatMap((path) => LOCALES.map((l) => `${SITE_URL}${localePath(l, path)}`));
  after(async () => {
    try {
      await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          host: new URL(SITE_URL).host,
          key,
          keyLocation: `${SITE_URL}/indexnow-key.txt`,
          urlList,
        }),
      });
    } catch {
      // Fire-and-forget by design.
    }
  });
}
