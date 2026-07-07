# 0001 — Custom-built admin, no CMS

Status: accepted (2026-07-06)

## Context

The admin backend must be usable by non-technical guest editors. Payload CMS 3 (embedded in Next.js) would provide editor UI, RBAC, drafts, and uploads out of the box, and was the initially recommended path.

## Decision

Build the admin by hand from libraries: Tiptap (rich text), shadcn/ui (components), react-hook-form + zod (forms), dnd-kit (ordering). Explicitly chosen by the project owner over Payload.

## Consequences

- Full control of every editorial affordance (札记 counter, 顺序即立场 reorder UX, publish gates) with no CMS abstraction fighting us.
- v1 already needed its own auth for public users (better-auth), so no auth-system overlap.
- We own all editor UX maintenance; there is no upgrade path to lean on. The Playwright suite covers the workflows a CMS would have guaranteed.
