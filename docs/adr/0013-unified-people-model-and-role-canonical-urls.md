# 0013 — Unified people model and role-canonical URLs

Status: accepted (2026-07-18).

## Context

Directors were first-class (own table, `/director/[slug]` pages, publishing, essays) while cast was a display-only `films.castJson` JSONB column — the v1 decision recorded in a schema comment ("Cast is display-only in v1 (no actor pages)"). That made actor → films navigation impossible, and the corpus already contains director-actors (Welles, Chaplin): a separate `actors` table would have split one human into two rows with two pages and baked the namesake/dedup problem in permanently. At the same time the site's positioning (收录即推荐, curation not IMDb) rules out mass-importing hundreds of cast names as thin pages.

## Decision

- **One `people` table**, renamed from `directors` via a data-preserving `ALTER TABLE … RENAME` (migration 0006), plus a `primaryRole` enum (`director` | `actor`, default `director`). Role-specific names stay wherever the role IS the semantics: the `film_directors` junction, `director_viewing_items`, the `fd.director` relation property, `/director` URLs, and 导演 UI copy. `media.director_id` became `person_id` — it means "image of this person", not a directing credit.
- **Cast is first-class**: `film_cast` rows (surrogate id + position — duplicate names are legal and saves replace the whole set, so no natural key) with denormalized `name`/`nameZh`/`character` and a nullable `personId` (`ON DELETE SET NULL`: deleting a person degrades a linked credit to the unlinked credit it was — the credit outlives the person). Migration 0007 backfilled every named castJson entry verbatim inside the migration, count-guarded before `DROP COLUMN cast_json`.
- **Curated-only corpus**: no person row is ever inferred from cast data. Editors create people and link cast rows by hand; unlinked rows render as plain text forever if nobody curates them.
- **Role-canonical URLs**: `primaryRole` picks each person's single canonical URL — `/director/[slug]` (the launched URLs stay byte-identical) or `/actor/[slug]` — and the other segment 308s to it (`permanentRedirect`). The canonical check runs BEFORE the ADR 0012 en-pending stub, so a stub exists at exactly one URL. Each segment's `generateStaticParams` is role-filtered; `dynamicParams` stays on (ADR 0012) so redirects and role changes need no redeploy. `personPath()` (`src/lib/routes.ts`) is the only way person URLs are built — HTML links, LocaleSwitch, sitemap, JSON-LD, IndexNow.
- **Lock order** generalizes to **people → films → lists**; `saveFilm` locks the union of directing credits and linked cast people in one sorted call.

## Consequences

- A person page shows both filmographies; a film someone directed AND acted in appears in both sections on purpose — the 出演作品 row carries the character (Chaplin as the Tramp), which the directed grid cannot.
- Changing a published person's role moves their canonical URL; the save notifies IndexNow for both the new and the now-308ing old path.
- Film pages link cast names on the same zh-published gate as the directedBy line (on `/en` a link may land on a translation-pending stub — sanctioned by ADR 0012); Movie JSON-LD gains an `actor` Person array whose `url`s use the stricter both-locales gate, and Person JSON-LD picks `jobTitle` by role (电影导演/Film director vs 演员/Actor).
- Cast credits cascade with their film and survive person deletion; `deletePerson` still refuses only for *directing* credits on published films.
- The films publish gate (≥1 director) and all 导演-labelled admin affordances are unchanged — "director" remains a role, not an entity.
