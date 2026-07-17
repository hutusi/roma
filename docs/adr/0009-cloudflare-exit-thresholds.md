# 0009 — Measurement thresholds for the Cloudflare-exit trigger

Status: accepted (2026-07-08)

## Context

ADR 0008 says revisit the Vercel-vs-Cloudflare choice "when mainland performance or Blob egress costs actually disappoint — measured, not assumed." That leaves the trigger unfalsifiable: without numbers and instruments, "disappoint" is a vibe. Two facts sharpen what to measure:

- Neither Vercel's nor Cloudflare's *ordinary* edge serves from inside mainland China; a real in-China win needs an ICP license plus a China-capable edge (Cloudflare China Network or an equivalent CDN) — a heavier, separate track from the compute platform. So the platform move and the China-latency fix are not the same project, and only measured China latency should drive either.
- Blob egress cost has a *contained* remedy (swap to R2 behind `src/lib/storage.ts`) that does not require leaving Vercel at all.

## Decision

Instrument both triggers and act on explicit thresholds, not impressions:

- **Mainland latency.** A self-hosted Web Vitals beacon (`src/components/site/rum-beacon.tsx` → `/api/rum` → `rum_events`) records real-user metrics, segmented `is_china` (geo header `country === 'CN'`). Read it at `/admin/metrics` (p50/p75/p95 over 7 days). **Trigger:** open the China-edge track (ICP filing first — it's the 4–8 week long pole) when, over a **≥ 2-week** window with **≥ 500 China samples**, **p75 LCP for the China segment stays > 4000 ms** or **p75 TTFB > 1800 ms** (the Web Vitals "poor" boundaries). Corroborate with a synthetic baseline (`docs/measurements/china-latency-baseline.md`).
- **Blob egress cost.** Record monthly Vercel Blob data-transfer GB + $ in `docs/measurements/blob-egress.md`. **Trigger:** do the R2 swap when monthly Blob egress cost exceeds the modelled R2 equivalent (≈ $0 egress + ~$0.015/GB-mo storage) by a clear margin for **two consecutive months** — review target **> $20/mo** until real numbers refine it. This swap is independent of any compute migration.

The full OpenNext/Workers migration remains gated separately on the external risk ADR 0008 named — `@opennextjs/cloudflare` cleanly supporting this Next 16 + `updateTag`/on-demand-ISR — which we re-check periodically, not on a schedule tied to these thresholds.

## Consequences

- "Measured, not assumed" becomes a dashboard-able rule; the two triggers are decoupled, so egress cost never forces a premature platform move and vice-versa.
- Beacon rows are anonymous, sampled (~20%), and land in the primary Postgres — a small, bounded write cost we accept for the signal (revisit sampling if volume grows).
- Raw beacon rows are retained for 90 days. A successful ingest schedules `after()` cleanup; a database-backed daily claim ensures concurrent requests perform at most one deletion pass, and the claim only advances when deletion commits. No aggregate archive is kept, so the effective window is 90–91 days.
- The China segment is only trustworthy while we serve directly from Vercel: it derives from `x-vercel-ip-country`, which a proxied (orange-cloud) Cloudflare in front would break. ADR 0011 keeps the domain DNS-only until that signal is re-sourced, so this trigger stays measurable.
- The thresholds are deliberately conservative placeholders; update this ADR as the baseline docs accumulate real numbers.
