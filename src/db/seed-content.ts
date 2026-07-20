/**
 * Seeds the editorial corpus — the curated films, their people (directors
 * and curated actors), and the
 * curated 片单 — plus TMDB imagery. Run with `bun run db:seed:content`
 * (Bun loads .env / .env.local automatically).
 *
 * Modelled on e2e/setup/reset-db.ts, but it NEVER drops the database. It is
 * a one-time bootstrap and safe to re-run:
 *   - films / directors / lists upsert by slug via onConflictDoNothing, so a
 *     re-run never clobbers content later edited through the admin;
 *   - join rows rely on their unique keys + onConflictDoNothing;
 *   - the image step skips any film/director that already has media.
 *
 * The `db:seed:content` script runs Bun with `--conditions=react-server` so
 * that `server-only` (imported transitively via src/lib/storage.ts) resolves
 * to its no-op variant, the same condition Next uses on the server.
 *
 * Images: without TMDB_API_TOKEN the run seeds text-only and logs a warning;
 * re-run with the token set to backfill posters/portraits. With
 * BLOB_READ_WRITE_TOKEN set, storeImage() writes to Vercel Blob; otherwise to
 * public/uploads (local dev). Attribution lives on /about.
 */
import { and, eq, inArray } from "drizzle-orm";
import { validateImageUpload } from "../lib/image-upload";
import { storeImage } from "../lib/storage";
import {
  codePointLength,
  EDITORIAL_NOTE_EN_MAX,
  EDITORIAL_NOTE_EN_MIN,
  EDITORIAL_NOTE_MAX,
  EDITORIAL_NOTE_MIN,
  wordCount,
} from "../lib/validators/film";
import { db } from "./index";
import {
  curatedListItems,
  curatedLists,
  directorViewingItems,
  filmCast,
  filmDirectors,
  films,
  filmTags,
  filmWatchLinks,
  media,
  people,
  seedFilmTagBaseline,
  seedTagBaseline,
  tags,
  users,
} from "./schema";
import { seedActors } from "./seed-data/actors";
import { seedDirectors } from "./seed-data/directors";
import { seedFilms } from "./seed-data/films";
import { seedLists } from "./seed-data/lists";
import { seedTags } from "./seed-data/tags";
import { filmTagKey, planFilmTags, planVocabulary, seededFilmTags } from "./tag-plan";

const NOW = Date.now();
/** Stagger publishedAt so the array order drives the home "近期收录" strip. */
const publishedAtFor = (index: number) => new Date(NOW - index * 3_600_000);

const counts = { people: 0, films: 0, lists: 0, items: 0, images: 0, imagesSkipped: 0 };

/** Everyone who gets a people row — the original directors plus curated actors. */
const seedPeople = [...seedDirectors, ...seedActors];

const TMDB_API = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/original";

async function tmdbGet(path: string, token: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${TMDB_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json() as Promise<Record<string, unknown>>;
}

async function downloadAsFile(url: string, name: string): Promise<File> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`image ${res.status}`);
  const type = (res.headers.get("content-type") ?? "image/jpeg").split(";", 1)[0];
  const ext = type.includes("png") ? "png" : type.includes("webp") ? "webp" : "jpg";
  return new File([await res.arrayBuffer()], `${name}.${ext}`, { type });
}

async function downloadAndStoreImage(url: string, name: string) {
  const image = await validateImageUpload(await downloadAsFile(url, name), 20 * 1024 * 1024);
  return {
    ...(await storeImage(image, "seed")),
    width: image.width,
    height: image.height,
  };
}

async function main() {
  // Attribute lists to the seed admin when it exists (nullable otherwise).
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@babuban.com";
  const admin = await db.query.users.findFirst({ where: eq(users.email, adminEmail) });
  const createdBy = admin?.id ?? null;

  // ── People (directors + curated actors) ────────────────────────────
  const insertedPeople = await db
    .insert(people)
    .values(
      seedPeople.map((d) => ({
        slug: d.slug,
        name: d.name,
        nameZh: d.nameZh,
        primaryRole: d.primaryRole ?? ("director" as const),
        bio: d.bio,
        careerEssay: d.careerEssay ?? null,
        bioEn: d.bioEn ?? null,
        careerEssayEn: d.careerEssayEn ?? null,
        // A seeded English edition publishes with the zh one.
        statusEn: (d.bioEn ? "published" : "draft") as "published" | "draft",
        status: "published" as const,
        publishedAt: new Date(NOW),
        publishedEnAt: d.bioEn ? new Date(NOW) : null,
      })),
    )
    .onConflictDoNothing({ target: people.slug })
    .returning({ slug: people.slug });
  counts.people = insertedPeople.length;

  const personRows = await db
    .select({ id: people.id, slug: people.slug })
    .from(people)
    .where(
      inArray(
        people.slug,
        seedPeople.map((d) => d.slug),
      ),
    );
  const personIdBySlug = new Map(personRows.map((r) => [r.slug, r.id]));

  // ── Films ──────────────────────────────────────────────────────────
  const insertedFilms = await db
    .insert(films)
    .values(
      seedFilms.map((f, i) => ({
        slug: f.slug,
        titleZh: f.titleZh,
        titleZhHk: f.titleZhHk ?? null,
        titleZhTw: f.titleZhTw ?? null,
        titleOriginal: f.titleOriginal,
        titleEn: f.titleEn ?? null,
        year: f.year,
        countries: f.countries,
        runtimeMinutes: f.runtimeMinutes ?? null,
        aspectRatio: f.aspectRatio ?? null,
        isBlackAndWhite: f.isBlackAndWhite,
        editorialNote: f.editorialNote,
        essay: f.essay ?? null,
        editorialNoteEn: f.editorialNoteEn ?? null,
        essayEn: f.essayEn ?? null,
        status: "published" as const,
        statusEn: (f.editorialNoteEn && f.titleEn ? "published" : "draft") as "published" | "draft",
        publishedAt: publishedAtFor(i),
        publishedEnAt: f.editorialNoteEn && f.titleEn ? publishedAtFor(i) : null,
      })),
    )
    .onConflictDoNothing({ target: films.slug })
    .returning({ slug: films.slug });
  counts.films = insertedFilms.length;
  const newFilmSlugs = new Set(insertedFilms.map((r) => r.slug));

  const filmRows = await db
    .select({ id: films.id, slug: films.slug })
    .from(films)
    .where(
      inArray(
        films.slug,
        seedFilms.map((f) => f.slug),
      ),
    );
  const filmIdBySlug = new Map(filmRows.map((r) => [r.slug, r.id]));

  // ── film ↔ director junction (position = order in directorSlugs) ────
  const fdValues = seedFilms.flatMap((f) =>
    f.directorSlugs.flatMap((ds, position) => {
      const filmId = filmIdBySlug.get(f.slug);
      const directorId = personIdBySlug.get(ds);
      return filmId && directorId ? [{ filmId, directorId, position }] : [];
    }),
  );
  if (fdValues.length) await db.insert(filmDirectors).values(fdValues).onConflictDoNothing();

  // ── Tags: a three-way merge against the recorded baseline ──────────
  // seed-data / baseline / database. Two of those cannot express intent —
  // a tag in seed-data but missing from the database is either something
  // this release adds or something an editor removed, and they look
  // identical. `seed_*_baseline` records what seed-data asserted at the
  // last successful run, which is the difference (ADR 0014).
  //
  // One path covers every case this used to special-case: a fresh
  // database (empty baseline, so everything is an addition), a film
  // created moments ago (no baseline, no junctions — same thing), a film
  // whose tagSlugs changed in this release, and a tag an editor retired.
  //
  // Writes and the baseline update share one transaction. If they did
  // not, a crash could leave a baseline claiming more than was applied,
  // and the next run would read those additions as editor removals — a
  // fresh way to reach the same bug.
  const tagSummary = await db.transaction(async (tx) => {
    const seedTagSlugs = seedTags.map((t) => t.slug);
    const tagBaseline = new Set(
      (await tx.select({ slug: seedTagBaseline.slug }).from(seedTagBaseline)).map((r) => r.slug),
    );
    const tagsInDb = new Set((await tx.select({ slug: tags.slug }).from(tags)).map((r) => r.slug));

    const { create, retired } = planVocabulary(seedTagSlugs, tagBaseline, tagsInDb);
    if (create.length) {
      const rows = seedTags.filter((t) => create.includes(t.slug));
      await tx.insert(tags).values(rows).onConflictDoNothing({ target: tags.slug });
    }

    // Re-read so newly created tags resolve, then plan the junctions.
    const tagIdBySlug = new Map(
      (await tx.select({ id: tags.id, slug: tags.slug }).from(tags)).map((r) => [r.slug, r.id]),
    );
    const junctionBaseline = new Set(
      (
        await tx
          .select({ filmSlug: seedFilmTagBaseline.filmSlug, tagSlug: seedFilmTagBaseline.tagSlug })
          .from(seedFilmTagBaseline)
      ).map(filmTagKey),
    );
    const slugById = new Map([...filmIdBySlug].map(([slug, id]) => [id, slug]));
    const junctionsInDb = new Set(
      (
        await tx
          .select({ filmId: filmTags.filmId, tagSlug: tags.slug })
          .from(filmTags)
          .innerJoin(tags, eq(tags.id, filmTags.tagId))
      ).flatMap((r) => {
        const filmSlug = slugById.get(r.filmId);
        return filmSlug ? [filmTagKey({ filmSlug, tagSlug: r.tagSlug })] : [];
      }),
    );

    // Only films actually present here — a seed film missing from this
    // database simply has nothing to link yet.
    const presentFilms = seedFilms.filter((f) => filmIdBySlug.has(f.slug));
    const { apply, removedByEditor } = planFilmTags(presentFilms, junctionBaseline, junctionsInDb);

    const rows = apply.flatMap((p) => {
      const filmId = filmIdBySlug.get(p.filmSlug);
      const tagId = tagIdBySlug.get(p.tagSlug);
      return filmId && tagId ? [{ filmId, tagId }] : [];
    });
    if (rows.length) await tx.insert(filmTags).values(rows).onConflictDoNothing();

    // Record what seed-data asked for this run — including entries left
    // alone, so a retired tag stays retired on every future run instead
    // of flipping back to "new".
    if (seedTagSlugs.length) {
      await tx
        .insert(seedTagBaseline)
        .values(seedTagSlugs.map((slug) => ({ slug })))
        .onConflictDoNothing();
    }
    const asserted = seededFilmTags(seedFilms);
    if (asserted.length) {
      await tx.insert(seedFilmTagBaseline).values(asserted).onConflictDoNothing();
    }

    return { created: create.length, linked: rows.length, retired, removedByEditor };
  });

  console.log(
    `Tags: created ${tagSummary.created} tag(s), linked ${tagSummary.linked} junction(s).`,
  );
  if (tagSummary.retired.length) {
    console.log(
      `  ${tagSummary.retired.length} tag(s) in seed-data were removed in /admin — left alone: ` +
        `${tagSummary.retired.join(", ")}`,
    );
  }
  if (tagSummary.removedByEditor.length) {
    console.log(
      `  ${tagSummary.removedByEditor.length} film-tag assignment(s) were removed in /admin — ` +
        "left alone.",
    );
  }

  // ── 演员表 — only for newly-created films (no natural unique key) ────
  const castValues = seedFilms
    .filter((f) => newFilmSlugs.has(f.slug) && f.cast?.length)
    .flatMap((f) =>
      (f.cast ?? []).map((m, position) => ({
        filmId: filmIdBySlug.get(f.slug) as string,
        position,
        name: m.name,
        nameZh: m.zhName ?? null,
        character: m.character ?? null,
        characterZh: m.characterZh ?? null,
        // Fresh seeds come out fully linked; existing DBs use link-cast.ts.
        personId: m.personSlug ? (personIdBySlug.get(m.personSlug) ?? null) : null,
      })),
    );
  if (castValues.length) await db.insert(filmCast).values(castValues);

  // ── 哪里能看 — only for newly-created films (no natural unique key) ──
  const wlValues = seedFilms
    .filter((f) => newFilmSlugs.has(f.slug) && f.watchLinks?.length)
    .flatMap((f) =>
      (f.watchLinks ?? []).map((w, sortOrder) => ({
        filmId: filmIdBySlug.get(f.slug) as string,
        platform: w.platform,
        region: w.region,
        url: w.url ?? null,
        note: w.note ?? null,
        noteEn: w.noteEn ?? null,
        sortOrder,
      })),
    );
  if (wlValues.length) await db.insert(filmWatchLinks).values(wlValues);

  // ── 建议观看顺序 — chronological path for directors with ≥2 films ───
  const viValues = seedDirectors.flatMap((d) => {
    const directorId = personIdBySlug.get(d.slug);
    if (!directorId) return [];
    const dFilms = seedFilms
      .filter((f) => f.directorSlugs.includes(d.slug))
      .sort((a, b) => a.year - b.year);
    if (dFilms.length < 2) return [];
    return dFilms.flatMap((f, position) => {
      const filmId = filmIdBySlug.get(f.slug);
      return filmId ? [{ directorId, filmId, position, note: null }] : [];
    });
  });
  if (viValues.length) await db.insert(directorViewingItems).values(viValues).onConflictDoNothing();

  // ── Curated lists ──────────────────────────────────────────────────
  const insertedLists = await db
    .insert(curatedLists)
    .values(
      seedLists.map((l) => ({
        slug: l.slug,
        title: l.title,
        theme: l.theme ?? null,
        intro: l.intro ?? null,
        titleEn: l.titleEn ?? null,
        themeEn: l.themeEn ?? null,
        introEn: l.introEn ?? null,
        status: "published" as const,
        statusEn: (l.titleEn ? "published" : "draft") as "published" | "draft",
        publishedAt: new Date(NOW),
        publishedEnAt: l.titleEn ? new Date(NOW) : null,
        sortOrder: l.sortOrder,
        createdBy,
      })),
    )
    .onConflictDoNothing({ target: curatedLists.slug })
    .returning({ slug: curatedLists.slug });
  counts.lists = insertedLists.length;

  const listRows = await db
    .select({ id: curatedLists.id, slug: curatedLists.slug })
    .from(curatedLists)
    .where(
      inArray(
        curatedLists.slug,
        seedLists.map((l) => l.slug),
      ),
    );
  const listIdBySlug = new Map(listRows.map((r) => [r.slug, r.id]));

  const itemValues = seedLists.flatMap((l) =>
    l.items.flatMap((it, position) => {
      const listId = listIdBySlug.get(l.slug);
      const filmId = filmIdBySlug.get(it.filmSlug);
      return listId && filmId
        ? [
            {
              listId,
              filmId,
              position,
              reasoning: it.reasoning ?? null,
              reasoningEn: it.reasoningEn ?? null,
            },
          ]
        : [];
    }),
  );
  if (itemValues.length) {
    const insertedItems = await db
      .insert(curatedListItems)
      .values(itemValues)
      .onConflictDoNothing()
      .returning({ id: curatedListItems.id });
    counts.items = insertedItems.length;
  }

  // ── Images (TMDB → storage seam) ────────────────────────────────────
  await seedImages(filmIdBySlug, personIdBySlug);

  // ── List covers — reuse the cover film's hero/poster, if not already set ─
  await setListCovers(listIdBySlug, filmIdBySlug);

  // ── Publish-gate assertions (fail the run rather than seed unpublishable) ─
  await assertPublishable(filmIdBySlug, newFilmSlugs);

  console.log(
    `\nSeed complete. Newly inserted — people:${counts.people} films:${counts.films} ` +
      `lists:${counts.lists} listItems:${counts.items}. ` +
      `Images stored:${counts.images} skipped:${counts.imagesSkipped}.`,
  );
  process.exit(0);
}

async function seedImages(filmIdBySlug: Map<string, string>, personIdBySlug: Map<string, string>) {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) {
    console.warn(
      "⚠ TMDB_API_TOKEN not set — seeding text-only. Re-run with the token set to backfill posters/portraits.",
    );
    return;
  }

  for (const f of seedFilms) {
    const filmId = filmIdBySlug.get(f.slug);
    if (!filmId) continue;
    if (await db.query.media.findFirst({ where: eq(media.filmId, filmId) })) continue;
    try {
      let hit: Record<string, unknown> | undefined;
      if (f.tmdbId) {
        hit = await tmdbGet(`/movie/${f.tmdbId}`, token);
      } else {
        const q = encodeURIComponent(f.titleOriginal || f.titleEn || f.titleZh);
        let data = await tmdbGet(`/search/movie?query=${q}&year=${f.year}`, token);
        let results = data.results as Record<string, unknown>[] | undefined;
        if (!results?.length) {
          const q2 = encodeURIComponent(f.titleEn || f.titleOriginal);
          data = await tmdbGet(`/search/movie?query=${q2}`, token);
          results = data.results as Record<string, unknown>[] | undefined;
        }
        hit = results?.[0];
      }
      if (!hit) {
        console.warn(`  film image ✗ ${f.slug}: no TMDB match`);
        counts.imagesSkipped++;
        continue;
      }
      const rows: (typeof media.$inferInsert)[] = [];
      if (typeof hit.poster_path === "string") {
        const stored = await downloadAndStoreImage(
          `${TMDB_IMG}${hit.poster_path}`,
          `${f.slug}-poster`,
        );
        rows.push({
          ...stored,
          alt: `《${f.titleZh}》（${f.year}）海报`,
          credit: "TMDB",
          kind: "poster",
          filmId,
          sortOrder: 0,
        });
      }
      if (typeof hit.backdrop_path === "string") {
        const stored = await downloadAndStoreImage(
          `${TMDB_IMG}${hit.backdrop_path}`,
          `${f.slug}-hero`,
        );
        rows.push({
          ...stored,
          alt: `《${f.titleZh}》（${f.year}）剧照`,
          credit: "TMDB",
          kind: "hero",
          filmId,
          sortOrder: 0,
        });
      }
      if (rows.length) {
        await db.insert(media).values(rows);
        counts.images += rows.length;
        console.log(`  film image ✓ ${f.slug} (+${rows.length})`);
      } else {
        counts.imagesSkipped++;
      }
    } catch (error) {
      console.warn(`  film image ✗ ${f.slug}: ${error instanceof Error ? error.message : error}`);
      counts.imagesSkipped++;
    }
  }

  for (const d of seedPeople) {
    const personId = personIdBySlug.get(d.slug);
    if (!personId) continue;
    if (await db.query.media.findFirst({ where: eq(media.personId, personId) })) continue;
    try {
      let person: Record<string, unknown> | undefined;
      if (d.tmdbPersonId) {
        person = await tmdbGet(`/person/${d.tmdbPersonId}`, token);
      } else {
        // Namesakes are common (a director and an actor share a name). Prefer
        // a credit in the person's own department that actually has a photo
        // before falling back.
        const wantDept = d.primaryRole === "actor" ? "Acting" : "Directing";
        const results = (await tmdbGet(`/search/person?query=${encodeURIComponent(d.name)}`, token))
          .results as Record<string, unknown>[] | undefined;
        person =
          results?.find(
            (r) => r.known_for_department === wantDept && typeof r.profile_path === "string",
          ) ??
          results?.find((r) => typeof r.profile_path === "string") ??
          results?.[0];
      }
      const profile = person?.profile_path;
      if (typeof profile !== "string") {
        counts.imagesSkipped++;
        continue;
      }
      const stored = await downloadAndStoreImage(`${TMDB_IMG}${profile}`, `${d.slug}-portrait`);
      await db.insert(media).values({
        ...stored,
        alt: `${d.nameZh}肖像`,
        credit: "TMDB",
        kind: "portrait",
        personId,
        sortOrder: 0,
      });
      counts.images++;
      console.log(`  portrait ✓ ${d.slug}`);
    } catch (error) {
      console.warn(`  portrait ✗ ${d.slug}: ${error instanceof Error ? error.message : error}`);
      counts.imagesSkipped++;
    }
  }
}

async function setListCovers(listIdBySlug: Map<string, string>, filmIdBySlug: Map<string, string>) {
  for (const l of seedLists) {
    if (!l.coverFilmSlug) continue;
    const listId = listIdBySlug.get(l.slug);
    const filmId = filmIdBySlug.get(l.coverFilmSlug);
    if (!listId || !filmId) continue;
    const current = await db.query.curatedLists.findFirst({
      where: eq(curatedLists.id, listId),
      columns: { coverMediaId: true },
    });
    if (current?.coverMediaId) continue; // don't clobber an admin choice
    const cover =
      (await db.query.media.findFirst({
        where: and(eq(media.filmId, filmId), eq(media.kind, "hero")),
      })) ??
      (await db.query.media.findFirst({
        where: and(eq(media.filmId, filmId), eq(media.kind, "poster")),
      }));
    if (cover) {
      await db
        .update(curatedLists)
        .set({ coverMediaId: cover.id })
        .where(eq(curatedLists.id, listId));
    }
  }
}

async function assertPublishable(filmIdBySlug: Map<string, string>, newFilmSlugs: Set<string>) {
  const problems: string[] = [];

  for (const f of seedFilms) {
    const len = codePointLength(f.editorialNote);
    if (len < EDITORIAL_NOTE_MIN || len > EDITORIAL_NOTE_MAX) {
      problems.push(
        `film ${f.slug}: editorial note ${len} code points (need ${EDITORIAL_NOTE_MIN}–${EDITORIAL_NOTE_MAX})`,
      );
    }
    if (f.editorialNoteEn) {
      const words = wordCount(f.editorialNoteEn);
      if (words < EDITORIAL_NOTE_EN_MIN || words > EDITORIAL_NOTE_EN_MAX) {
        problems.push(
          `film ${f.slug}: English note ${words} words (need ${EDITORIAL_NOTE_EN_MIN}–${EDITORIAL_NOTE_EN_MAX})`,
        );
      }
      if (!f.titleEn) problems.push(`film ${f.slug}: English note without titleEn`);
    }
    // A typo'd tag slug would silently drop the junction row above.
    const knownTags = new Set(seedTags.map((t) => t.slug));
    for (const ts of f.tagSlugs ?? []) {
      if (!knownTags.has(ts)) problems.push(`film ${f.slug}: unknown tag slug "${ts}"`);
    }
  }

  // Confirm the DB actually holds ≥1 director per seeded film (catches a
  // dropped junction row from a bad reference).
  const filmIds = [...filmIdBySlug.values()];
  if (filmIds.length) {
    const linked = await db
      .select({ filmId: filmDirectors.filmId })
      .from(filmDirectors)
      .where(inArray(filmDirectors.filmId, filmIds));
    const withDirector = new Set(linked.map((r) => r.filmId));
    for (const [slug, id] of filmIdBySlug) {
      if (!withDirector.has(id)) problems.push(`film ${slug}: no director linked in DB`);
    }
  }

  // Same shape, for tags: every film this run created must actually hold
  // the junctions its tagSlugs imply. main()'s pre-flight should have made
  // this unreachable — it is here so a silently dropped junction fails the
  // run rather than shipping an untagged film.
  const newWithTags = seedFilms.filter((f) => newFilmSlugs.has(f.slug) && f.tagSlugs?.length);
  if (newWithTags.length) {
    const ids = newWithTags.flatMap((f) => {
      const id = filmIdBySlug.get(f.slug);
      return id ? [id] : [];
    });
    const held = ids.length
      ? await db
          .select({ filmId: filmTags.filmId, slug: tags.slug })
          .from(filmTags)
          .innerJoin(tags, eq(tags.id, filmTags.tagId))
          .where(inArray(filmTags.filmId, ids))
      : [];
    const heldByFilm = new Map<string, Set<string>>();
    for (const row of held) {
      const set = heldByFilm.get(row.filmId) ?? new Set<string>();
      set.add(row.slug);
      heldByFilm.set(row.filmId, set);
    }
    for (const f of newWithTags) {
      const id = filmIdBySlug.get(f.slug);
      if (!id) continue;
      const have = heldByFilm.get(id) ?? new Set<string>();
      for (const ts of f.tagSlugs ?? []) {
        if (!have.has(ts)) {
          problems.push(
            `film ${f.slug}: tag "${ts}" not linked in DB (absent from the vocabulary?)`,
          );
        }
      }
    }
  }

  for (const l of seedLists) {
    if (!l.items.length) problems.push(`list ${l.slug}: no items`);
  }

  if (problems.length) {
    console.error(`\n✗ Publish-gate check failed:\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
