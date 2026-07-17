import { after, type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { rumEvents } from "@/db/schema";
import { runRumRetention } from "@/lib/rum-retention";

/**
 * Ingest for the real-user Web Vitals beacon (see RumBeacon). Anonymous
 * and unauthenticated by design — it records an aggregate latency signal
 * for the ADR 0008 Cloudflare-exit decision, not per-user data. The
 * mainland segment is derived here from the edge geo header so the
 * client never has to know its own country.
 *
 * `x-vercel-ip-country` is Vercel's geo header; on a future Cloudflare
 * deploy this becomes `request.cf.country`. It's a header we read, not a
 * platform SDK, so it doesn't deepen lock-in (ADR 0008 constraint 3).
 * This header only stays authoritative while we serve directly from
 * Vercel — putting Cloudflare in proxied (orange-cloud) mode in front
 * would make it report the PoP, zeroing the China segment. ADR 0011
 * keeps the domain DNS-only until the country signal is re-sourced.
 *
 * Abuse protection lives at the platform edge (Vercel WAF/BotID), not
 * here: a mainland audience sits behind heavy CGNAT, so a per-IP limit
 * in-app would silently drop the very China samples we're trying to
 * count. Skew from a flood is further bounded by robust percentiles and
 * the min-sample gate in ADR 0009. Values are clamped below.
 */
const beaconSchema = z.object({
  name: z.enum(["TTFB", "FCP", "LCP", "CLS", "INP"]),
  // Timings are milliseconds; clamp absurd values so an open endpoint
  // can't poison the aggregates with Infinity/garbage.
  value: z.number().finite().min(0).max(1_000_000),
  rating: z.enum(["good", "needs-improvement", "poor"]).optional(),
  path: z.string().min(1).max(512),
});

export async function POST(request: NextRequest) {
  // sendBeacon posts as text/plain, so parse the raw body ourselves.
  let payload: unknown;
  try {
    payload = JSON.parse(await request.text());
  } catch {
    return NextResponse.json(
      { ok: false },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const parsed = beaconSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const country = request.headers.get("x-vercel-ip-country");
  try {
    await db.insert(rumEvents).values({
      metric: parsed.data.name,
      value: parsed.data.value,
      rating: parsed.data.rating,
      path: parsed.data.path,
      country,
      isChina: country === "CN",
    });
  } catch (error) {
    // Fire-and-forget beacon: a DB hiccup shouldn't surface as a 500 with
    // a full stack per request. Log once and shed the write.
    console.error("rum ingest insert failed:", error);
    return new NextResponse(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }

  after(async () => {
    await runRumRetention().catch((error) => {
      console.error("rum retention cleanup failed:", error);
    });
  });

  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
