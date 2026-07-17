import { boolean, index, pgTable, real, text, timestamp } from "drizzle-orm/pg-core";
import { createdAt, primaryId } from "./helpers";

/**
 * Real-user Web Vitals, self-reported by a client island (no Google /
 * third-party script — ADR 0002). This table exists to measure ADR
 * 0008's Cloudflare-exit trigger: mainland-China page performance.
 * `is_china` is derived server-side from the request geo header so the
 * publish decision can segment China (CN) from everyone else without a
 * join. Rows are anonymous and sampled — this is an aggregate signal,
 * not per-user telemetry.
 */
export const rumEvents = pgTable(
  "rum_events",
  {
    id: primaryId(),
    /** Web Vital name: TTFB, FCP, LCP, CLS, INP (see next/web-vitals). */
    metric: text().notNull(),
    /** Metric value, milliseconds for timings; CLS is unitless. */
    value: real().notNull(),
    /** Qualitative rating from web-vitals: good | needs-improvement | poor. */
    rating: text(),
    /** Page path the metric was measured on (e.g. /film/some-slug). */
    path: text().notNull(),
    /** ISO 3166-1 alpha-2 from the edge geo header; null when unknown. */
    country: text(),
    /** country === 'CN' — the mainland segment ADR 0008's trigger tracks. */
    isChina: boolean().notNull().default(false),
    createdAt: createdAt(),
  },
  // created_at is the ONLY predicate this table is queried by:
  // getRumSummary — its entire read surface — filters a time window and
  // GROUPs BY (metric, is_china). Grouping is not a filter, so an index
  // can't help those two and none should be added for them.
  //
  // The previous index led with metric, which Postgres could still use —
  // but only by bitmap-scanning the WHOLE index and filtering on the
  // non-leading column, never a range scan. Leading with created_at
  // turns that into a real Index Scan with an Index Cond, and the table
  // is append-only so the window is a contiguous tail. Measured on 200k
  // rows at correlation 0.9997: ~19ms -> ~11ms, and the index is ~29%
  // smaller (6184kB -> 4408kB), which matters because every row here is
  // written on the app's hottest path (/api/rum, ~1 row per page view).
  (t) => [index("rum_events_created_idx").on(t.createdAt)],
);

/** Singleton-style timestamps for opportunistic maintenance jobs. */
export const maintenanceRuns = pgTable("maintenance_runs", {
  job: text().primaryKey(),
  lastSuccessfulRunAt: timestamp({ withTimezone: true }).notNull(),
});
