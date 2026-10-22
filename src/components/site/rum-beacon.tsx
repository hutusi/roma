"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Real-user Web Vitals beacon. Reports Core Web Vitals to our own
 * `/api/rum` endpoint so we can measure mainland-China page performance
 * — the trigger that would justify the Cloudflare exit (ADR 0008).
 *
 * Self-hosted by design: `useReportWebVitals` bundles the measurement
 * into our own JS and posts to our own origin, with no Google or other
 * third-party script (ADR 0002). The country segment is derived
 * server-side in the route from the edge geo header, not here.
 */

// Only these Core Web Vitals are persisted; Next also emits custom
// hydration/render metrics we don't need for the latency question.
const TRACKED = new Set(["TTFB", "FCP", "LCP", "CLS", "INP"]);

// Sample to bound write volume on the primary database — an aggregate
// signal doesn't need every page load. Tune here if the sample is thin.
const SAMPLE_RATE = 0.2;

// Both decided once per page load (module scope runs once per document).
// Sampling per load keeps a sampled load's vitals together instead of a
// random 20% of each metric. And every vital belongs to the hard
// navigation that loaded the page: LCP, CLS and INP are often reported
// only when the tab is hidden, by which time location.pathname may be
// a page the reader soft-navigated to later.
const sampled = typeof window !== "undefined" && Math.random() < SAMPLE_RATE;
const landingPath = typeof window !== "undefined" ? window.location.pathname : "";

export function RumBeacon() {
  useReportWebVitals((metric) => {
    if (!sampled || !TRACKED.has(metric.name)) return;

    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: landingPath,
    });

    // sendBeacon survives page unload (LCP/CLS finalize on hide). Where
    // it is missing or refuses the payload, a keepalive fetch is the best
    // effort — and a lost sample is not worth an unhandled rejection.
    if (navigator.sendBeacon?.("/api/rum", body)) return;
    fetch("/api/rum", { method: "POST", body, keepalive: true }).catch(() => {});
  });

  return null;
}
