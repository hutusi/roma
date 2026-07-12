# 0012 — Symmetric locale URLs: one `[lang]` tree, `/zh` + `/en`, en-pending stubs

Status: accepted (2026-07-12). Supersedes the routing and subset-presentation decisions of ADR 0010; its content model, editorial workflow, and listing/SEO subset rule remain current.

## Context

ADR 0010 rested on three premises that no longer hold. First, it treated the launched zh URLs as frozen — but the site, though deployed to production since 2026-07-11, is unannounced, so a URL move is nearly free now and never again. Second, it assumed a `[lang]` segment implied a proxy in the serving path — in fact `generateStaticParams` prerenders both locales at build time and unknown paths are the only requests that reach a function, exactly as before; middleware is only needed for Accept-Language auto-detection, which we don't want (x-default stays zh). Third, `/en` was conceived as a curated subset — the intent is now bilingual parity with language switching as a first-class feature: a reader on any film page can always cross to the other language.

The two-root-layout structure also had a real ongoing cost: ~19 route files existed twice as thin locale-hardcoded wrappers, every new public route had to be written in both trees, and cross-locale navigation forced a full page load.

## Decision

- **Routing**: one root layout at `app/[lang]` (a documented Next pattern), `generateStaticParams` over `zh`/`en`. URLs are symmetric: `/zh/...` and `/en/...`; `/` 308s to `/zh`. Locale validity is enforced by `parseLocale()` (`src/i18n/params.ts`) at render time in every server file under the tree — deliberately **not** `dynamicParams = false`, which cascades to child segments and would 404 newly published slugs until a redeploy. No middleware locale detection; the fully-static serving posture of ADR 0005/0008 is unchanged.
- **Redirects**: every launch-era root URL family 308s to its `/zh` equivalent via an **enumerated** table in `next.config.ts`. No catch-all regex funnel — redirects run before the filesystem, so a `(?!zh|en|…)` pattern would silently capture every future top-level route or metadata file. Locale-less garbage gets Next's bare 404; revisit with `global-not-found` once stable.
- **Admin**: stays zh-only at `/admin` as its own root-layout tree (`app/admin`), sharing `DocumentShell` (fonts per ADR 0002, `<html>`/`<body>` skeleton) with the site tree. The static segment wins over `[lang]`; admin ↔ site navigation is a full page load.
- **En-pending stubs**: a zh-published entity whose English edition isn't published resolves on `/en` to a noindex *translation-pending* stub — entity name (`titleEn ?? titleOriginal` / romanized `name`; a list falls back to its zh proper-noun title, the one sanctioned zh string on `/en`), a pending notice, and a link to the zh page. Enforced structurally: the `get*StubBySlug` queries (`src/db/queries/public.ts`) select only locale-safe columns. Stubs are excluded from en listings, sitemap, hreflang, RSS, and JSON-LD (`visibleIn` and the `statusEn` write model are unchanged); HTML deliberately links stubs (list members, profile marks, the now-total `LocaleSwitch`) while JSON-LD doesn't — don't hand crawlers a noindex URL as an ItemList item.
- **Prerendering**: detail routes generate the zh slug set for both locales, so stubs are static; `publish*En` flips a stub to the full page through `revalidate.ts` (which now refreshes the `/zh` and `/en` prefixes) with no redeploy.
- **hreflang**: `zh-CN` → `/zh/...` always, doubling as `x-default`; `en` only when the English edition is published.
- **Copy placement**: page-local prose stays with the page — co-located `COPY = { zh, en }` objects for short strings (home, indexes, error, not-found), per-locale content components for the about essay. Dictionaries remain chrome-only.

## Consequences

- Every URL moved once: sitemap resubmission in GSC/Bing, zh feed GUIDs change once (`isPermaLink` URLs now `/zh/...`), social caches re-scrape OG images.
- New public routes are written once and localized via `params.lang`; the "add every route to both trees" tax is gone. Language switching is a soft client-side navigation.
- "404 on /en" no longer signals "not translated" — monitoring and editors should expect stubs instead.
- Single-file OG cards keep a static, locale-neutral Latin `alt` (a per-locale `generateImageMetadata` variant exists if zh alts become mandatory).
- The styled 404 copy renders after hydration (`not-found.tsx` is a client component reading `useParams()`); the 404 status itself is always correct.
- Full page load between admin and the site (they no longer share a root layout).
