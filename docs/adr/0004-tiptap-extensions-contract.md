# 0004 — One Tiptap extension list as editor↔renderer contract

Status: accepted (2026-07-06)

## Context

Rich text is stored as Tiptap JSON and must be rendered safely on public pages. Any drift between what the editor can produce and what the renderer understands silently drops or mangles content.

## Decision

`src/components/tiptap/extensions.ts` is the single extension list, imported by both the admin editor and the public static renderer (`render.tsx`, via `@tiptap/static-renderer`). The renderer allowlists: unknown nodes render nothing, links must be http(s), images must come from Blob or `/uploads`. No `dangerouslySetInnerHTML` anywhere.

## Consequences

- Editor preview and public pages cannot disagree; XSS surface is the allowlist, not stored HTML.
- Adding any rich-text capability is a two-sided change by construction — extend the shared list and the renderer's mappings together.
