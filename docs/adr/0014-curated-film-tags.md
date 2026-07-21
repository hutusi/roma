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

## Amendment (2026-07-20) — the seeder records what it applied

The original gate seeded tags on the first run only, detected by an empty `tags` table. That left new seed films arriving on a populated database with no junctions at all, silently — and four review rounds each found a different bug in the attempts to fix it. They are worth listing, because they were all one mistake:

1. A reconciler recreated every seed tag missing from the database, undoing an editor's `deleteTag`, and refilled every film with zero junctions — a state `saveFilm` produces whenever an editor clears a film's tags.
2. Tag changes to films that already existed reached production through no path at all, and the runbook's wording steered the operator past the gap.
3. The tool that fixed those tags also overwrote editorial prose, so the command recommended for a tag silently reverted notes rewritten in `/admin` — while its output mentioned only the tag.
4. The first-run signal itself was flippable: `deleteTag` can empty the `tags` table, which read as "fresh database" and restored all nineteen seeded tags plus junctions across the whole catalogue.

### The cause was a missing input, not four missing guards

Every one of those compares two things — what seed-data says now, and what the database holds. **Two inputs cannot express intent.** A tag in seed-data but absent from the database is *either* something the release adds *or* something an editor removed, and no query distinguishes them. Each fix compensated by demanding the information from a human: an explicit `--create-tags` list, an explicit `--films` list, a `--tags-only` flag, a drift warning to be read against release notes.

**`seed_tag_baseline` and `seed_film_tag_baseline` record the third input** — what seed-data asserted at the last successful run — and the decision becomes a three-way merge, the shape git uses on a file:

| seed-data | baseline | database | meaning | action |
|---|---|---|---|---|
| yes | no | — | this release adds it | **write** |
| yes | yes | no | an editor removed it | leave, report |
| yes | yes | yes | already applied | nothing |
| no | yes | yes | release dropped it | leave, report |

Row two is what all four bugs got wrong. Row four keeps removal an `/admin` act: seed-data dropping a tag is never grounds to delete an editor's row.

### Consequences

- **A content deploy is `db:migrate && db:seed:content` again.** One path covers a fresh database, a film created moments ago, a film retagged by this release, and a tag an editor retired. New and existing films stop being separate cases: a film that did not exist a moment ago has no baseline and no junctions, which is the definition of an addition.
- **Four mechanisms and two tools are gone** — the first-run gate, the `newFilmSlugs`-scoped junction path, the *generic* pre-flight that refused any tag missing from the vocabulary, the actionable drift report, `apply-tags.ts`, and `resync-content --tags-only`. The prose/tag coupling of bug 3 cannot recur because resync has no tag mode.
- **One narrow gate replaced that generic pre-flight**, firing only where seed-data and an editorial decision genuinely conflict: seed-data assigns a tag an editor retired. The seeder will not recreate the tag, and will not publish a film knowing one of its curated tags was dropped, so it stops and asks. Every other missing tag is now simply created.
- **The core seed is one transaction, and the publish gate runs inside it.** Locks are taken first in the canonical order, then the conflict gate, then every insert, then `assertPublishable`. This exists because both gates used to run in the wrong place: the conflict gate before any lock (so an editor deleting a tag mid-run slipped past it, and films published before the tag work was known to be possible), and the publish gate *after every insert had committed* — so a note outside its length window published the whole batch and only then failed. A failure now rolls everything back. Images stay outside: they are network I/O and best-effort, and holding row locks across TMDB downloads would block `/admin` for minutes. The cost is that `/admin` saves block for the length of the seed — under a second text-only.
- **Writes and the baseline update share one transaction.** Apart, a crash could leave a baseline claiming more than was applied, and the next run would read those additions as editor removals — a fresh route to bug 1.
- **Keyed by slug, no foreign keys.** The baseline must outlive the row it describes; a cascade would erase exactly the record proving an editor removed something.
- **The baseline records what seed-data asked for, including entries left alone**, so a retired tag stays retired on every future run instead of flipping back to "new".
- **One-time blind spot.** The bootstrap migration seeds the baseline from whatever the database already holds, so a tag removed *before* it cannot be seen and will be re-applied once. Confirm the target's tags match seed-data before migrating where that is possible.
- The decision rules are pure functions in `src/db/tag-plan.ts` with unit tests carrying each bug as a named case. All four lived in scripts that touch a database and therefore had no automated coverage at all.
