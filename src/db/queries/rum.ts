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

export type RumRouteSummary = {
  route: string;
  samples: number;
  lcpP75: number | null;
  inpP75: number | null;
  clsP75: number | null;
};

/**
 * p75 of the three Core Web Vitals per kind of page — slugs and
 * usernames collapse to [slug] / [name], so 74 film pages read as one
 * row. Answers "which pages are slow", which the per-metric summary
 * can't. Rows with fewer than `minSamples` beacons are dropped as noise.
 */
export async function getRumByRoute(days = 7, minSamples = 5): Promise<RumRouteSummary[]> {
  const route = sql<string>`regexp_replace(
    regexp_replace(${rumEvents.path}, '^/(zh|en)/(film|list|director|actor)/[^/]+', '/\\1/\\2/[slug]'),
    '^/(zh|en)/u/[^/]+', '/\\1/u/[name]')`;
  const p75 = (metric: string) =>
    sql<
      number | null
    >`percentile_cont(0.75) within group (order by ${rumEvents.value}) filter (where ${rumEvents.metric} = ${metric})`;
  return db
    .select({
      route,
      samples: sql<number>`count(*)::int`,
      lcpP75: p75("LCP"),
      inpP75: p75("INP"),
      clsP75: p75("CLS"),
    })
    .from(rumEvents)
    .where(sql`${rumEvents.createdAt} >= now() - make_interval(days => ${days})`)
    .groupBy(route)
    .having(sql`count(*) >= ${minSamples}`)
    .orderBy(sql`4 desc nulls last`);
}
