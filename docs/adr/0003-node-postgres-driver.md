# 0003 — node-postgres everywhere, not neon-http

Status: accepted (2026-07-06)

## Context

The original plan pinned Neon's HTTP driver for serverless. But `neon-http` cannot run interactive transactions, which list reordering and the invite flow require, and it cannot talk to a local Postgres in dev.

## Decision

`pg` (node-postgres) in every environment: local Postgres in dev/e2e, Neon's pooled endpoint in production. Pool cached on `globalThis` for dev HMR, with an `error` listener (idle-client drops otherwise crash the process).

## Consequences

- Full transaction support; dev/prod behavior parity; trivially portable to any Postgres (see ADR 0008).
- Cold serverless invocations pay TCP+TLS setup that neon-http avoids; acceptable at this traffic, mitigated by Vercel's warm instances.
- Neon's pooler (pgbouncer) handles prepared statements at the protocol level; migrations use the unpooled URL.
