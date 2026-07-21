# 0016 — External identifiers on films: pointers out, not a database posture

Status: accepted (2026-07-22).

## Context

The site's stance is curation, not database — Criterion/MUBI in spirit, explicitly not Douban/IMDb (CONTEXT.md, ADR 0013). But three unrelated needs kept circling the same missing data. Operationally, the seeder and admin import resolve TMDB by title+year search and then *discard* the id, so image re-fetch and metadata re-import stay guesswork (ADR 0015 started pinning `tmdbId` in seed data for this reason, without persisting it). For SEO, the Movie JSON-LD had no `sameAs`, which is the schema.org hook crawlers use to reconcile an entity against knowledge graphs. And for readers, a film page offered no way to jump to the places people actually track films — 豆瓣 for the mainland audience, IMDb for the English one.

Alongside the ids, two physical-metadata gaps surfaced: the corpus now contains silent-era films (神女, 战舰波将金号…) with nothing marking them, and no home for restoration provenance ("which version am I actually watching") — the most Criterion-shaped fact a curated page can state.

## Decision

- **Four external ids as nullable columns on `films`, stored bare, never as URLs**: `tmdbId` (int, unique), `imdbId` (`tt…`, unique), `doubanId` (numeric string, unique), `wikidataId` (`Q…`). URLs are built in exactly one place, `src/lib/external-ids.ts` — the same one-predicate-shared shape as the tiptap link policy (ADR 0004).
- **Display is a courtesy pointer, not a feature.** One discreet 外部链接 line near 哪里能看, showing only the reader-facing pair, ordered for the audience: /zh leads 豆瓣 then IMDb (IMDb is blocked in the mainland), /en leads IMDb then Douban (labelled "Douban", romanized — no zh prose on /en, ADR 0012). No ratings, no counts, no widgets. TMDB and Wikidata ids are never rendered.
- **All present ids feed `sameAs`** on the Movie JSON-LD node — the entity-reconciliation payoff costs nothing once the ids exist.
- **`isSilent` boolean, defaulting false**, mirroring `isBlackAndWhite`: a physical attribute every film states, never a tag (ADR 0014). The facts line shows 默片/Silent only when true — talkies are the default and get no word.
- **`restorationNote` / `restorationNoteEn` nullable text**, shown under 哪里能看 when present; /en omits it when the En side is empty. Colour process (Technicolor and friends) is deliberately *not* modelled — when it matters it belongs in the essay.
- **Ids are pipeline-resolved, hand-verified**: `src/db/enrich-external-ids.ts` walks TMDB → IMDb → Wikidata (P345), harvesting QID + Douban id (P4529) and cross-checking Wikidata's own TMDB claim (P4947). Its silent-film genre hint is a review aid; `isSilent` stays curated (it missed 城市之光, which no one classifying by claim would catch).

## Consequences

- The seeder now persists `tmdbId` instead of treating it as an image-lookup hint, and the admin TMDB import keeps the entered id and prefills `imdbId` from `external_ids`. Re-imports are deterministic for every film that carries the id.
- Existing prod rows never receive new seed fields (`onConflictDoNothing`), so the corpus backfill is its own script, `src/db/backfill-metadata.ts` — metadata columns only, dry-run default, same host-banner conventions as `resync-content.ts`, which stays prose-only. After editors start correcting ids in /admin, run it only with an explicit `--films` list.
- `films` gains three unique constraints; `saveFilm`'s duplicate-key error now names the colliding field instead of blaming the slug.
- 73/74 films carry a Douban id (Wikidata has none for 一条安达鲁狗); Wikidata QIDs and IMDb ids are complete. Gaps stay null and render as nothing.

## Not changed

收录即推荐 — inclusion is still the recommendation, and nothing on the page imports external ratings or review counts. ADR 0014's tag vocabulary. ADR 0012's locale and en-subset rules. The watch-links table remains the only editor-curated outbound URLs.
