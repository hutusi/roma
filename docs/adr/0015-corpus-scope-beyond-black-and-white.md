# 0015 — Corpus scope: classic cinema, with Chinese-language film as a first-class axis

Status: accepted (2026-07-20).

## Context

The repositioning that produced [ADR 0014](0014-curated-film-tags.md) already declared the catalogue's subject to be classic cinema in general, with black-and-white a house preference rather than a boundary. `docs/CONTEXT.md` and the About page have said so since. Nothing tested the claim: all fifty films were black-and-white, none was later than 1966, and — on a Chinese-language site, written in Chinese, for a mainland-China audience — not one was Chinese-language.

That last gap was never an editorial position. It is where seeding happened to start, and it persisted because nothing in the codebase or the docs treated it as a defect. A reader arriving at 八部半 could reasonably have concluded the site considered Chinese cinema out of scope, which is the opposite of what it believes.

Two mechanical facts made this more than a content backlog item. `film_tags` junctions seed on the first run only (ADR 0014's gate), so a batch of new films would arrive on production carrying no tags at all, silently. And the seeder's image step resolves TMDB by title search and takes the first result unverified, which is tolerable for *Otto e mezzo* and not for 神女.

## Decision

- **The catalogue's boundary is classic cinema.** Not black-and-white, and not pre-1967. `isBlackAndWhite` stays a per-film attribute that every film states explicitly, and never a tag (ADR 0014 unchanged). The corpus now contains colour films and films through 2000, so the claim is demonstrated rather than asserted.
- **Chinese-language cinema is a first-class axis, not a regional footnote.** 费穆, 吴永刚, 袁牧之, 蔡楚生, 郑君里, 侯孝贤, 杨德昌, 王家卫 and 胡金铨 are canon *here* in a way they are not on Criterion, and the 华语经典 片单 headlines the site at `sortOrder: 0`. Country strings use the existing `中国 / 中国香港 / 中国台湾` pairs in `src/i18n/countries.ts`; no new mapping was required.
- **TMDB imagery is permitted, and the handbook now says so.** The handbook previously read 绝不从 TMDB 导入图片 while `seed-content.ts` had been importing TMDB posters and backdrops since launch, crediting them `"TMDB"`. Documentation losing to code in silence is worse than either rule; the rule is now the one we actually follow. The ban on streaming screenshots stands, the preference for public-domain and Wikimedia sources stands, and `credit` remains mandatory. Note plainly what the credit means: TMDB is an aggregator, so `"TMDB"` records where a file came from, not who owns the underlying artwork.
- **TMDB ids are pinned on everything added from this batch onward.** `tmdbId` on films, `tmdbPersonId` on people. The search fallback happens to resolve correctly today — verified against the live API for all twenty-four films and twenty-six people — but it takes `results[0]` without verification, and its second attempt drops the year filter entirely. A re-ranking would attach a wrong poster silently, and a wrong poster is indistinguishable from a right one. Existing entries predate the policy and already carry seeded imagery, so backfilling them would be inert.
- **Reconciling an admin-owned tag vocabulary is `src/db/apply-tags.ts`**, not a change to the first-run gate. See the amendment to ADR 0014.

## Consequences

- `into-black-and-white` becomes one lens among several rather than the site's thesis. Its own intro — black-and-white as a way of seeing — remains valid, so the list is unchanged apart from `sortOrder`.
- **Changing the featured list on production is a manual `/admin/lists` edit.** `curated_lists` upserts with `onConflictDoNothing`, so the `sortOrder` values in `lists.ts` apply only to a fresh database. This is the same class of trap as the tag gate: a seed edit that appears to work and silently does nothing on prod.
- **List covers render through a hard `grayscale` filter** at `src/app/[lang]/page.tsx`, `lists/page.tsx`, and `components/user/follows-page.tsx`. Film-card posters do not. With colour films in the corpus this is visible for the first time, so it is now a deliberate house style rather than an invisible no-op. The 华语经典 cover is deliberately a B&W film. Revisit if the grayscale treatment starts fighting the catalogue.
- Array order in `films.ts` is load-bearing and now documented there: `publishedAtFor(i)` derives `publishedAt` from the index, and only films a given run actually inserts get new timestamps. On a fresh database the first entries win the homepage 近期收录 strip; on production, where existing rows keep their original timestamps, the newly inserted films do.
- **Known gap, not addressed here:** `media.alt` is generated in Chinese for both locales (`《片名》（年份）剧照`), so `/en` pages carry zh alt text. This predates the batch and affects every film and person equally. Fixing it needs either an `altEn` column or locale-time generation, and is deliberately out of scope.

## Not changed

ADR 0014's vocabulary contract (both names required, admin-owned, first-run seeding, B&W never a tag). ADR 0012's locale rules and the en-subset visibility rule. ADR 0005's SSG posture — the batch is pure data and required no migration.
