import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { rumEvents } from "@/db/schema";

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
  await db.insert(rumEvents).values({
    metric: parsed.data.name,
    value: parsed.data.value,
    rating: parsed.data.rating,
    path: parsed.data.path,
    country,
    isChina: country === "CN",
  });

  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}
