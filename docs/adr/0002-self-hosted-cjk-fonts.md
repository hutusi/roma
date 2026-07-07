# 0002 — Self-hosted sliced CJK fonts; no Google CDN ever

Status: accepted (2026-07-06)

## Context

The audience is mainland-China Chinese readers; `fonts.googleapis.com` is blocked there, and `next/font/google` also mislabels Noto Serif SC subsets. A naïve CJK webfont is megabytes.

## Decision

Self-host via Fontsource packages: Noto Serif SC ships ~100 `unicode-range` slices per weight (browsers fetch ~3KB slices on demand), Playfair Display for Latin display type. OG images vendor exactly the slices covering the 八部半 wordmark (116KB in `src/assets/og/`) — arbitrary CJK titles ride in `og:title` text instead of the image.

## Consequences

- No Google dependency at build or runtime; per-page font payload stays in the tens of KB.
- Weights limited to 400/700 (each weight multiplies slice count).
- OG cards show generic Latin text for Chinese titles; a slice-picking loader is the recorded follow-up if that ever matters.
