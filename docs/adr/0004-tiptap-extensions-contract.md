# 0004 — One Tiptap extension list as editor↔renderer contract

Status: accepted (2026-07-06)

## Context

Rich text is stored as Tiptap JSON and must be rendered safely on public pages. Any drift between what the editor can produce and what the renderer understands silently drops or mangles content.

## Decision

`src/components/tiptap/extensions.ts` is the single extension list, imported by both the admin editor and the public static renderer (`render.tsx`, via `@tiptap/static-renderer`). The renderer allowlists: unknown nodes render nothing, links must satisfy the shared protocol policy (`link-policy.ts`: http(s) or mailto), images must come from Blob or `/uploads`. No `dangerouslySetInnerHTML` anywhere.

## Consequences

- Editor preview and public pages cannot disagree; XSS surface is the allowlist, not stored HTML.
- Adding any rich-text capability is a two-sided change by construction — extend the shared list and the renderer's mappings together.
- (2026-07-17) The link-protocol policy is part of the contract, defined once in `src/components/tiptap/link-policy.ts` and shared by the save gate, the renderer, and the toolbar. It allows exactly http(s) + mailto — the two schemes the editor can produce (toolbar submits policy-approved hrefs; autolink emits only web URLs and emails) — so a link can never be saved and then silently degrade to plain text publicly.
