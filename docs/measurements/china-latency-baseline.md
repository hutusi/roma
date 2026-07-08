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
- a `/film/[slug]` page — SSG editorial (pick a stable published slug)
- a `/_next/static/...` asset — cache/CDN delivery
- a Blob image URL (`https://<id>.public.blob.vercel-storage.com/...`) — image egress path

## Baseline runs

### YYYY-MM-DD — tool: <17ce | itdog | boce>

| URL type | China median TTFB (ms) | China median full load (ms) | Notes |
|---|---|---|---|
| `/` (home) | _tbd_ | _tbd_ | |
| `/film/[slug]` | _tbd_ | _tbd_ | |
| static asset | _tbd_ | _tbd_ | |
| Blob image | _tbd_ | _tbd_ | |

> Trigger reference (ADR 0009): the China-edge track opens when real-user
> **p75 LCP > 4000 ms** or **p75 TTFB > 1800 ms** for the China segment
> holds over a ≥ 2-week window. Use this synthetic table to sanity-check
> whether the RUM numbers reflect the network or something app-side.
