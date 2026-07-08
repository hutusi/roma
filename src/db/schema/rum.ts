import { boolean, index, pgTable, real, text } from "drizzle-orm/pg-core";
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
  // The aggregation query slices by metric + segment over a time window.
  (t) => [index("rum_events_metric_created_idx").on(t.metric, t.createdAt)],
);
