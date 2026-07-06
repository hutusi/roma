"use server";

import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { filmDirectors, films, filmWatchLinks } from "@/db/schema";
import type { TiptapDoc } from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { revalidateFilm } from "@/lib/revalidate";
import {
  filmFormSchema,
  parseCountries,
  publishProblems,
  type FilmFormValues,
} from "@/lib/validators/film";
import { fail, ok, type ActionResult } from "./result";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

export async function saveFilm(
  id: string | null,
  values: FilmFormValues,
): Promise<ActionResult<{ id: string }>> {
  await requireEditor();
  const parsed = filmFormSchema.safeParse(values);
  if (!parsed.success) {
    return fail(parsed.error.issues.map((i) => i.message).join("；"));
  }
  const v = parsed.data;

  const row = {
    slug: v.slug,
    titleZh: v.titleZh,
    titleZhHk: v.titleZhHk || null,
    titleZhTw: v.titleZhTw || null,
    titleOriginal: v.titleOriginal,
    titleEn: v.titleEn || null,
    year: v.year,
    countries: parseCountries(v.countries),
    runtimeMinutes: typeof v.runtimeMinutes === "number" ? v.runtimeMinutes : null,
    aspectRatio: v.aspectRatio || null,
    isBlackAndWhite: v.isBlackAndWhite,
    editorialNote: v.editorialNote || null,
    essay: (v.essay as TiptapDoc) ?? null,
    castJson: v.cast,
  };

  try {
    const filmId = await db.transaction(async (tx) => {
      let targetId = id;
      if (targetId) {
        await tx.update(films).set(row).where(eq(films.id, targetId));
        await tx.delete(filmWatchLinks).where(eq(filmWatchLinks.filmId, targetId));
        await tx.delete(filmDirectors).where(eq(filmDirectors.filmId, targetId));
      } else {
        const [created] = await tx.insert(films).values(row).returning({ id: films.id });
        targetId = created.id;
      }
      if (v.watchLinks.length) {
        await tx.insert(filmWatchLinks).values(
          v.watchLinks.map((link, i) => ({
            filmId: targetId,
            platform: link.platform,
            region: link.region,
            url: link.url || null,
            note: link.note || null,
            sortOrder: i,
          })),
        );
      }
      if (v.directorIds.length) {
        await tx.insert(filmDirectors).values(
          v.directorIds.map((directorId, i) => ({
            filmId: targetId,
            directorId,
            position: i,
          })),
        );
      }
      return targetId;
    });
    revalidateFilm(v.slug);
    return ok({ id: filmId });
  } catch (error) {
    if (isUniqueViolation(error)) return fail(`slug「${v.slug}」已被使用`);
    throw error;
  }
}

export async function publishFilm(id: string): Promise<ActionResult> {
  await requireEditor();
  const film = await db.query.films.findFirst({ where: eq(films.id, id) });
  if (!film) return fail("影片不存在");
  const [{ n: directorCount }] = await db
    .select({ n: count() })
    .from(filmDirectors)
    .where(eq(filmDirectors.filmId, id));
  const problems = publishProblems({
    editorialNote: film.editorialNote,
    directorCount,
  });
  if (problems.length) return fail(problems.join("；"));
  await db
    .update(films)
    .set({ status: "published", publishedAt: film.publishedAt ?? new Date() })
    .where(eq(films.id, id));
  revalidateFilm(film.slug);
  return ok();
}

export async function unpublishFilm(id: string): Promise<ActionResult> {
  await requireEditor();
  const film = await db.query.films.findFirst({ where: eq(films.id, id) });
  if (!film) return fail("影片不存在");
  await db.update(films).set({ status: "draft" }).where(eq(films.id, id));
  revalidateFilm(film.slug);
  return ok();
}

export async function deleteFilm(id: string): Promise<ActionResult> {
  await requireEditor();
  const film = await db.query.films.findFirst({ where: eq(films.id, id) });
  if (!film) return fail("影片不存在");
  await db.delete(films).where(eq(films.id, id));
  revalidateFilm(film.slug);
  return ok();
}
