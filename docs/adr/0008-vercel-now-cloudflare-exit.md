# 0008 — Launch on Vercel; Cloudflare is the designated exit

Status: accepted (2026-07-07)

## Context

Cloudflare is attractive — R2's zero-egress pricing matters for a stills-heavy site, Workers limits are generous, and mainland connectivity is often somewhat better. But Next.js on Cloudflare means the OpenNext adapter reimplementing exactly the ISR/tag-revalidation semantics the publish flow depends on, plus known-fragile areas (OG image generation, `next/image`). v1 is verified end-to-end against Vercel primitives.

## Decision

Launch on Vercel (Neon Postgres + Vercel Blob, per DEPLOY.md). Record Cloudflare as the planned exit and preserve it by constraint:

1. All storage stays behind `src/lib/storage.ts` (Blob → R2 is a contained swap).
2. Standard Postgres via node-postgres (Hyperdrive-compatible; see ADR 0003).
3. Adopt no further Vercel-only APIs.

Revisit when mainland performance or Blob egress costs actually disappoint — measured, not assumed — using the e2e suite as the migration safety net.

## Consequences

- Zero migration work now; a future move is a bounded project (adapter + storage backend + cache infra) with tests that define "done".
- Until then we pay Vercel Blob egress and accept Vercel's mainland reachability.
