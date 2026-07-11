# Mainland-China latency baseline

Ground-truth latency from inside mainland China, independent of any RUM
pipeline. Re-run quarterly (or after any infra change) and append a dated
row set. This is the synthetic corroboration for the ADR 0009 trigger;
the live real-user numbers live at `/admin/metrics`.

## How to capture

Use a free Chinese multi-city speed test — **17ce.com**, **itdog.cn**, or
**boce.com** — against the production URLs below. Record the median (or a
representative spread) of first-byte and full-load times across the
mainland nodes. Test the real domain (`babuban.com`), not `*.vercel.app`
(the latter is DNS-polluted/SNI-blocked in China and unrepresentative).

URLs to test:

- `/` — SSG home
- `/film/otto-e-mezzo` — SSG editorial (a stable published slug)
- a `/_next/static/...` asset — cache/CDN delivery
- a Blob image URL (`https://<id>.public.blob.vercel-storage.com/...`) — image egress path

## Baseline runs

### 2026-07 — first post-launch baseline (pending capture — owner)

Prod went live 2026-07-11. Run a mainland multi-city test (17ce/itdog/boce)
against the production URLs above and replace the placeholders below with
the medians. Do NOT infer these from anywhere else — they are the synthetic
ground truth for ADR 0009.

| URL type | China median TTFB (ms) | China median full load (ms) | Notes |
|---|---|---|---|
| `/` (home) | _pending_ | _pending_ | |
| `/film/otto-e-mezzo` | _pending_ | _pending_ | |
| static asset | _pending_ | _pending_ | |
| Blob image | _pending_ | _pending_ | |

> Trigger reference (ADR 0009): the China-edge track opens when real-user
> **p75 LCP > 4000 ms** or **p75 TTFB > 1800 ms** for the China segment
> holds over a ≥ 2-week window. Use this synthetic table to sanity-check
> whether the RUM numbers reflect the network or something app-side.
