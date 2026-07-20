# 0014 — Curated film tags, not a folksonomy

Status: accepted (2026-07-18).

## Context

Repositioning the product around classic cinema in general (rather than "black-and-white first") left the catalogue with no vocabulary for what a film *is* beyond decade and country: no genre, movement, or theme. Curated lists group films deliberately but are essays, not attributes; `countries` and the derived decade are the only facets on `/films`. At the same time, the site's stance (收录即推荐, curation not database) rules out both freeform tagging and imported genre taxonomies — near-duplicate labels and missing English names would violate the bilingual contract (no zh prose on `/en`, ADR 0012) one tag at a time.

## Decision

- **A curated bilingual vocabulary**: a `tags` table (`slug` unique, `nameZh` NOT NULL, `nameEn` NOT NULL) managed only in `/admin/tags`. The film form picks from existing tags; there is no create-on-the-fly path. Requiring `nameEn` at creation is the structural guarantee that a tag can never leak zh prose onto `/en`.
- **Films only**, via a `film_tags` junction (composite PK, cascade both ways, no `position` — tags are an unordered set; display sorts by localized label). People and lists stay untagged until a real need appears.
- **No public tag URLs**: tags surface as chips on film pages (linking to `/films?tag=slug`) and a `?tag` facet on `/films` beside decade/country/palette — the same client-island filter pattern (ADR 0005). The `?tag` param carries the slug, so it is locale-neutral by construction (unlike `?country`). Tag pages with sitemap/hreflang/en-subset obligations can come later without schema changes.
- **Black-and-white is not a tag.** It stays the `films.isBlackAndWhite` boolean — an attribute every film must state, not a label some films carry.
- **Tags have no status columns.** A tag has no page of its own, so visibility rides entirely on the films that carry it; tag mutations invalidate the editorial tree without notifying IndexNow (the media precedent — there is no tag URL to recrawl).
- **Lock order** generalizes to **people → tags → films → lists**. `saveFilm` locks referenced tags after people, before the film row; `deleteTag` locks the tag, then its films, and refuses while any *published* film still carries the tag (the `deletePerson` shape: refusal only where a published page would silently change).

## Consequences

- Editors must name a tag in both languages before it exists at all — translation debt cannot accumulate in the vocabulary.
- Renaming a tag rewrites every chip through one editorial-tree sweep; no per-entity invalidation map to maintain.
- Movie JSON-LD gains a locale-appropriate `genre` array from the film's tags.
- Deleting a tag attached only to drafts just works (junction cascades); detaching it from published films is a deliberate per-film editorial act first.
- The seeded vocabulary (~12 movements/genres/themes) is a starting point, not a taxonomy commitment — the admin can rename or retire any of it. The seeder only bootstraps an empty vocabulary (first-run semantics); once any tag exists, re-runs never resurrect renamed or deleted tags.

## Amendment (2026-07-20) — reconciling an already-owned vocabulary

The first-run gate has a consequence that was not obvious when it was written: because it skips the *entire* tags block, new seed films arriving on a populated database get no `film_tags` rows at all, and nothing reports it. The failure is silent — the films publish, and simply carry no tags. [ADR 0015](0015-corpus-scope-beyond-black-and-white.md)'s batch of twenty-four films would have landed that way.

The gate is still correct and stays. Reconciling an already-owned vocabulary is a different operation and gets a different tool: **`src/db/apply-tags.ts`** (`bun run apply:tags`, dry-run by default, `--apply` to write). It does not weaken the contract above:

- It only ever INSERTs. A tag whose names have drifted from `tags.ts` is reported and left alone, because renaming is the admin's prerogative.
- It fills only films carrying **zero** junctions. A film with no tags has demonstrably never been curated in `/admin`, which is what makes filling it safe — and it is what prevents a tag an editor deliberately detached from being re-attached on the next run. `--force-films=` overrides this for named slugs when a film genuinely needs topping up.
- Seed films absent from the target database are named in the output rather than skipped in silence, since a quietly short junction count is the exact failure the script exists to prevent.

`tags.ts` therefore remains the source of truth for the starter vocabulary on an *empty* database (local dev, e2e, any future environment). It is not optional to keep it current: `assertPublishable` hard-exits on a `tagSlugs` entry with no matching `seedTags` row, so a tag created only through `/admin` would break `db:seed:content` on every fresh checkout. `src/db/seed-data/tags.test.ts` lifts that check into CI.
