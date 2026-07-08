import { sql } from "drizzle-orm";
import { db } from "@/db";
import { rumEvents } from "@/db/schema";

/**
 * Percentile summary of real-user Web Vitals, sliced by metric and by
 * the mainland-China segment. This is the read side of the ADR 0008
 * Cloudflare-exit trigger: if p75 TTFB/LCP for `isChina` rows stays poor
 * over time, that's the measured signal (not an assumption) that would
 * justify moving to a China-capable edge.
 */
export type RumMetricSummary = {
  metric: string;
  isChina: boolean;
  samples: number;
  p50: number;
  p75: number;
  p95: number;
};

export async function getRumSummary(days = 7): Promise<RumMetricSummary[]> {
  return db
    .select({
      metric: rumEvents.metric,
      isChina: rumEvents.isChina,
      samples: sql<number>`count(*)::int`,
      p50: sql<number>`percentile_cont(0.5) within group (order by ${rumEvents.value})`,
      p75: sql<number>`percentile_cont(0.75) within group (order by ${rumEvents.value})`,
      p95: sql<number>`percentile_cont(0.95) within group (order by ${rumEvents.value})`,
    })
    .from(rumEvents)
    .where(sql`${rumEvents.createdAt} >= now() - make_interval(days => ${days})`)
    .groupBy(rumEvents.metric, rumEvents.isChina);
}
