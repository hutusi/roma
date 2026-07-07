# 0007 — QA stack: Biome, bun test, Playwright vs production build; e2e on main only

Status: accepted (2026-07-07)

## Context

v1 was verified by throwaway browser scripts; nothing was committed, no CI existed. Next 16 removed `next lint`, leaving linting/formatting to choose fresh.

## Decision

- **Biome** (exact-pinned) replaces ESLint + Prettier; `next`/`react` rule domains stand in for eslint-config-next. Vendored shadcn components are formatted but not linted.
- **bun test** for pure logic (colocated `*.test.ts`); no component tests — the browser suite covers rendering.
- **Playwright** runs against a **production build** on an **ephemeral `roma_test` DB** (provisioned at the head of the webServer command, since Playwright starts webServer before globalSetup and the build prerenders DB-backed pages). One worker; fixtures include known regressions.
- **CI:** `checks.yml` on every PR + main push; `e2e.yml` on main pushes and manual dispatch **only** — a deliberate trade for a fast PR loop.
- **Red main e2e = fix-forward.** Ship the fix; don't revert, don't disable the suite. Local verification before landing on main remains the real deploy gate (Vercel deploys on push).

## Consequences

- Regressions can reach main (and production) for the minutes it takes e2e to run and a fix to land — accepted for a low-traffic editorial site.
- The one-time Biome reformat is a large diff wall in history (single commit, mechanical).
