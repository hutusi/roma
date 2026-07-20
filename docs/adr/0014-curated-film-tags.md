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

## Amendment (2026-07-20) — tagging films the seeder creates

The first-run gate has a consequence that was not obvious when it was written: because it skips the *entire* tags block, new seed films arriving on a populated database got no `film_tags` rows at all, and nothing reported it. The films published and simply carried no tags. [ADR 0015](0015-corpus-scope-beyond-black-and-white.md)'s batch of twenty-four films would have landed that way.

**The gate stays. What changed is where a new film's junctions come from.** `seed-content.ts` now writes them for films in `newFilmSlugs` on every run — the same scoping that already governs `film_cast` and `film_watch_links`, for the same reason. A film the run just created has no editorial history to undo; an existing film does. Tag ids resolve from the database, never from `tags.ts`, and a pre-flight aborts the run **before any write** if an incoming film references a slug the vocabulary does not hold, naming the slugs and the command that creates them. Aborting before the first insert matters: failing afterwards would leave the films present, so a retry would no longer see them as new and they would stay untagged permanently.

### Correcting this amendment as first written

The original version claimed `apply-tags.ts` could safely reconcile a whole database because it "fills only films carrying zero junctions — a film with no tags has demonstrably never been curated." **That was wrong, and so was the tool built on it.** Two inferences were unsound:

- **A tag slug missing from the database is not necessarily new.** `deleteTag` lets an editor retire a tag once no published film carries it, so an absent slug is just as likely to be one deliberately removed. Recreating it from `tags.ts` silently reverted that decision.
- **Zero junctions does not mean never curated.** `saveFilm` deletes every junction and re-inserts only a non-empty selection (`src/actions/films.ts`), and the validator sets no minimum — so an editor clearing a film's tags leaves zero rows, indistinguishable from a film nobody has touched.

These compound rather than sitting apart. `deleteTag` refuses while a published film still carries the tag and instructs the editor to detach it film by film first — producing exactly the zero-junction films *and* the deletable tag that both heuristics would then undo. The documented way to retire a tag was the one operation guaranteed to be reverted, which is precisely the failure this ADR's gate exists to prevent.

### Junction ownership, by lifecycle

The muddle underneath all of this was never answering *who owns a film's tags*. Settled:

| Stage | Owner | Mechanism |
|---|---|---|
| At creation | seed-data | `seed-content.ts`, scoped to `newFilmSlugs` |
| Thereafter | `/admin` | the film form; the seeder never revisits |
| An explicit seed-driven correction | operator | `resync-content.ts --films=…`, add-only |
| The vocabulary itself | `/admin` | `apply-tags.ts -- --create-tags=…` for named slugs |

`resync-content.ts` already existed for exactly the middle case — "overwrite the editorial content fields of specific rows from seed-data, by slug" — and tags were simply missing from its remit. Since `seed-content.ts` writes junctions only for films it creates, a `tagSlugs` change to a film that already exists reaches production through resync and nowhere else. Its tag handling is **add-only**: a tag in the database but not in seed-data is reported and left alone. That asymmetry with the prose fields it overwrites is deliberate — prose is single-valued so overwriting is the only coherent option, whereas tags are a set under admin ownership, and fixing a typo in an `editorialNote` must not silently discard curation as a side effect. Removing a tag stays an `/admin` act.

Because a silent no-op is what caused this in the first place, `seed-content.ts` also **reports** existing films whose seed tags the database lacks, printing the resync command. It never acts on that itself: a film appears in that list just as easily because an editor removed the tag on purpose.

`apply-tags.ts` is therefore reduced to one job — creating **named** vocabulary entries. With no flags it does nothing and says so. It never infers intent from database state.

`tags.ts` remains the source of truth for the starter vocabulary on an *empty* database (local dev, e2e, any future environment). It is not optional to keep it current: `assertPublishable` hard-exits on a `tagSlugs` entry with no matching `seedTags` row, so a tag created only through `/admin` would break `db:seed:content` on every fresh checkout. `src/db/seed-data/tags.test.ts` lifts that check into CI.
