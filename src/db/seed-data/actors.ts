import type { SeedDirector } from "./types";

/**
 * Curated actors (primaryRole "actor" — canonical URL /actor/[slug]).
 * 收录即推荐 applies to people: only actors who anchor the corpus get
 * entries; every other cast credit stays an unlinked film_cast row.
 * `tmdbPersonId` is always pinned — the portrait search fallback can't be
 * trusted for actors with namesakes. Cast rows point here via
 * `personSlug` in films.ts; link-cast.ts backfills existing databases.
 */
export const seedActors: SeedDirector[] = [];
