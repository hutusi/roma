/**
 * Fills media.dominant_color for images uploaded before the column
 * existed (migration 0016). New uploads get it at upload time; this is a
 * one-off per environment, and safe to rerun — it only touches NULL rows.
 *
 * Fetches each image by its public URL (Blob in production,
 * public/uploads locally), measures it with sharp, and writes #rrggbb.
 * Runs outside Next, so it can't revalidate: redeploy afterwards (or let
 * the next editorial save sweep the tree) for pages to pick it up.
 *
 * Run: DATABASE_URL=… bun run backfill:colors [--site=https://babuban.com]
 */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { eq, isNull } from "drizzle-orm";
import sharp from "sharp";
import { hexColor } from "@/lib/image-upload";
import { db } from "./index";
import { media } from "./schema";

const site =
  process.argv.find((a) => a.startsWith("--site="))?.slice("--site=".length) ??
  "http://localhost:3000";

async function bytesOf(url: string): Promise<Buffer> {
  // Local dev uploads are site-relative paths under public/.
  if (url.startsWith("/")) return readFile(join(process.cwd(), "public", url));
  const res = await fetch(new URL(url, site), { signal: AbortSignal.timeout(20_000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

const rows = await db
  .select({ id: media.id, url: media.url })
  .from(media)
  .where(isNull(media.dominantColor));
console.log(`${rows.length} images without a dominant colour`);

let done = 0;
let failed = 0;
for (const row of rows) {
  try {
    const { dominant } = await sharp(await bytesOf(row.url)).stats();
    await db
      .update(media)
      .set({ dominantColor: hexColor(dominant) })
      .where(eq(media.id, row.id));
    done++;
  } catch (error) {
    failed++;
    console.warn(`  ✗ ${row.url}: ${error instanceof Error ? error.message : error}`);
  }
}
console.log(`filled ${done}, failed ${failed}`);
process.exit(failed ? 1 : 0);
