# 0011 — Keep Cloudflare DNS-only until the China-edge track begins

Status: accepted (2026-07-12)

## Context

The mainland-latency trigger in ADR 0009 depends on one signal: the real-user beacon's `is_china` segment, derived server-side in `src/app/api/rum/route.ts` from Vercel's `x-vercel-ip-country` edge header (`country === 'CN'`). That header is populated by Vercel's edge from the **connecting client IP**.

babuban.com resolves through Cloudflare DNS (ADR 0008 names Cloudflare as the designated exit). Cloudflare records can be **gray-cloud (DNS-only)** — Cloudflare answers DNS and the browser connects straight to Vercel — or **orange-cloud (proxied)** — Cloudflare terminates the connection and Vercel sees *Cloudflare's* egress IPs.

If the domain is ever flipped to orange-cloud without re-sourcing the geo signal, `x-vercel-ip-country` stops reflecting the visitor and instead reflects the Cloudflare PoP (or is absent). The China segment silently collapses toward zero. The failure is worse than losing data: an empty China segment reads on `/admin/metrics` as *excellent* China latency, so it can't trip the ADR 0009 "poor" thresholds — the exact decision this instrument exists to inform is quietly disabled, and looks healthy while disabled. Nothing in the repo recorded this coupling; this ADR fixes that.

## Decision

- Keep all babuban.com records **gray-cloud (DNS-only)** in Cloudflare until the China-edge track (ADR 0009 — ICP filing + a China-capable edge) is *deliberately* started. Until then Cloudflare is DNS + registrar only; the serving path is browser → Vercel, and `x-vercel-ip-country` stays authoritative.
- Enabling Cloudflare proxying (orange-cloud), or any other reverse proxy in front of Vercel, is a **coupled change**: the country signal MUST be re-sourced in the same cutover — read `CF-IPCountry` (Cloudflare proxy) or `request.cf.country` (Workers) instead of / in addition to `x-vercel-ip-country`, and restore the client's real IP (`CF-Connecting-IP`) for anything else that reads geo. The RUM route already flags the `request.cf.country` successor inline.
- This is orthogonal to the R2 storage swap (ADR 0009), which touches only `src/lib/storage.ts` and needs no DNS change.

## Consequences

- The ADR 0009 mainland-latency trigger stays measurable and falsifiable for as long as we serve directly from Vercel — which is the whole pre-exit window.
- Whoever performs the eventual Cloudflare cutover inherits a written checklist item (re-source geo) instead of a silent trap. Cross-referenced from ADR 0009 and from the RUM route comment.
- A DNS-only posture forgoes Cloudflare's proxy features (WAF-at-edge, caching, orange-cloud DDoS absorption) for now. Acceptable: those are part of the deliberate exit, not a pre-exit tweak, and the abuse posture for the one open endpoint is unchanged (ADR 0009 / the RUM route note).
