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

export function RumBeacon() {
  useReportWebVitals((metric) => {
    if (!TRACKED.has(metric.name)) return;
    if (Math.random() >= SAMPLE_RATE) return;

    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: window.location.pathname,
    });

    // sendBeacon survives page unload (LCP/CLS finalize on hide); fall
    // back to a keepalive fetch where it's unavailable.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/rum", body);
    } else {
      void fetch("/api/rum", { method: "POST", body, keepalive: true });
    }
  });

  return null;
}
