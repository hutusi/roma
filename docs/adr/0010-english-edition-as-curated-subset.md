# 0010 — English edition as a curated subset under /en

Status: accepted (2026-07-11); routing & subset-presentation superseded by [ADR 0012](0012-symmetric-locale-urls-and-en-pending-stubs.md) (2026-07-12) — the content model, editorial workflow, and listing/SEO subset rule remain current

## Context

The product is a Chinese-language curatorial site (ADR 0002's audience), but we want real English readership — full content i18n, not UI chrome around Chinese essays. Constraints: launched zh URLs must not change, editorial pages stay fully SSG with no proxy in the serving path (ADR 0005, the China-latency posture of ADR 0008/0009), and the editorial voice must survive translation — machine translation is off the table.

## Decision

- **Routing**: two root layouts, not a `[lang]` segment. The zh tree moved under the `(zh)` route group (URLs unchanged); `/en` is a self-contained subtree with its own root layout (`html lang="en"`, English chrome, Source Serif 4 body type via an `html:lang(en)` override). Each tree has a `[...rest]` catch-all for styled 404s (global-not-found is still experimental). Cross-locale navigation is a full page load — acceptable for a language switch.
- **Subset rule**: an entity is en-visible ⇔ published in zh AND en (`statusEn` per entity). `/en` only lists and statically generates the en-published subset; everything else 404s there. The English site is itself a curation — no half-translated pages, translations roll out gradually.
- **Content model**: explicit `*En` columns beside the zh fields (house style, CONTEXT.md 译名) plus `statusEn`/`publishedEnAt` per entity. Slugs are shared (already romanized). Countries stay zh strings with a zh↔en display map.
- **Editorial workflow**: editors dual-author in the same admin forms; the English note gates on 120–350 words (`publishEnProblems`) — the zh 200–500 code-point rule has no meaning in English. Lists keep every zh-published member in order on /en (顺序即立场); untranslated members render unlinked.
- **Strings**: hand-rolled server-only dictionaries for shared components only; locale-specific pages keep prose inline; client islands get labels as props. Admin stays Chinese.
- **SEO**: hreflang clusters (zh always, doubling as x-default; en only when the edition exists) in metadata and sitemap; per-locale OG routes.
- **Cache**: `revalidate.ts` refreshes both locales' paths unconditionally; tags stay locale-free — one row holds both editions.

## Consequences

- Every new public route must be added to both trees; every article carries an optional-but-forever English translation cost. This is the accepted price of a real English audience.
- Static page count roughly doubles as translations land (trivial at this scale).
- Users have no stored locale preference yet; the reset email is bilingual. Recorded follow-up if English readership materializes: per-user locale, localized transactional email, an English RSS feed.
- User areas (`/u`, `/me`, `/account`) are localized under `/en` (chrome only — usernames and user-authored list titles/descriptions stay as authored; a user's marks/lists are shown in full, linking to `/en` for en-published entities and falling back to the zh page otherwise). The invite flow (`/invite/[token]` — invitations come from the zh editorial team) and the admin stay zh-only.

## Deferred follow-ups

The edition is complete and live: the full corpus is authored and English-published (all 50 films / 24 directors / 7 lists), the `/en` user areas are localized (PR #12), and the AI-drafted prose was fact-checked and corrected in both languages (PR #13, via `src/db/resync-content.ts`). The SEO surface is verified healthy — `sitemap.xml` carries every en entity with a hreflang cluster, page `<head>` alternates are bidirectional (`zh-CN` / `en` / `x-default`, x-default → zh root), and the user areas stay `noindex`.

Remaining, in rough priority — none blocking:

- **English RSS feed** (`/en/rss.xml`) over the en-published films — net-new, self-contained (no schema/auth/migration); aids syndication.
- **Per-user locale** (`users.locale`) + single-language transactional email — retires the bilingual reset stopgap noted above; needs a prod migration.
- **Correctness cleanups** (not i18n): media-manager upload `try/finally` (a thrown upload leaves the button stuck at "上传中…"); the invite create-form's unconditional "copied" toast on a clipboard failure; unguarded `authClient.signOut()` in the admin sign-out button and the header auth-menu.
- **`countries.ts` maintenance** — the hand-kept zh↔en map is guarded by a seed-corpus coverage test; add a pair when a new country appears (it renders in zh on `/en` until then).
- **Collapse the `[...rest]` 404 workaround** — each tree catches its own strays pending Next's `global-not-found` stabilizing.
- **SEO handoff (owner action)** — resubmit `sitemap.xml` in Google Search Console + Bing Webmaster Tools and watch the Coverage + International-Targeting (hreflang) reports for the new `/en` URLs.
