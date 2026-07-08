# 0006 — 'editor' is an app-level role, outside better-auth's access control

Status: accepted (2026-07-06)

## Context

better-auth's admin plugin knows `user`/`admin`; registering a third role would require adopting its `createAccessControl` permission matrix — machinery three fixed roles don't need.

## Decision

`role` stays a plain text column. Authorization is our own guards (`src/lib/auth-guards.ts`): `requireUser/requireEditor/requireAdmin`, called at the top of every admin page **and** every mutating server action (layouts don't re-run on soft navigation; `proxy.ts` is UX-only). Role changes write the column directly instead of `auth.api.setRole` (which validates against its own role list). `adminRoles: ['admin']` still gates better-auth's own admin APIs (ban, listUsers).

## Consequences

- No permission-matrix boilerplate; the whole model is readable in one file.
- Guard placement is a convention, not a framework guarantee — the e2e role tests are the enforcement.
