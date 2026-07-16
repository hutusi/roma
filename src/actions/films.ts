"use server";

import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import type { TiptapDoc } from "@/db/schema";
import {
  curatedListItems,
  filmDirectors,
  films,
  filmWatchLinks,
  userListItems,
  userMarks,
} from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { revalidateFilm } from "@/lib/revalidate";
import {
  type FilmFormValues,
  filmFormSchema,
  parseCountries,
  publishEnProblems,
  publishProblems,
} from "@/lib/validators/film";
import { type ActionResult, fail, ok } from "./result";

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
    editorialNoteEn: v.editorialNoteEn || null,
    essayEn: (v.essayEn as TiptapDoc) ?? null,
    castJson: v.cast,
  };

  const existing = id
    ? await db.query.films.findFirst({
        where: eq(films.id, id),
        columns: { slug: true, status: true, statusEn: true },
      })
    : undefined;
  // A slug change must also ping the URL the film used to live at, so
  // engines recrawl it and find the 404.
  const previousSlug = existing?.slug;
  const isPublic = existing?.status === "published";

  // Saving a draft is deliberately laxer than publishing one, but that
  // laxness was only ever meant for drafts: nothing re-checked the gate
  // once a row was live, so a published film could be saved down to a
  // 3-character note or zero directors and stay published, with the
  // public queries trusting the status flag. Re-run the gate the row
  // already passed, and reject the save rather than silently
  // unpublishing work the editor didn't ask to take down.
  if (isPublic) {
    const problems = publishProblems({
      editorialNote: v.editorialNote || null,
      directorCount: v.directorIds.length,
    });
    if (problems.length) return fail(`影片已发布，不能存为不可发布的状态：${problems.join("；")}`);
  }
  if (existing?.statusEn === "published") {
    const problems = publishEnProblems({
      titleEn: v.titleEn || null,
      editorialNoteEn: v.editorialNoteEn || null,
    });
    if (problems.length)
      return fail(`英文版已发布，不能存为不可发布的状态：${problems.join("；")}`);
  }

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
            noteEn: link.noteEn || null,
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
    revalidateFilm(v.slug, { notify: isPublic });
    if (isPublic && previousSlug && previousSlug !== v.slug) {
      revalidateFilm(previousSlug, { notify: true });
    }
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
  revalidateFilm(film.slug, { notify: true });
  return ok();
}

export async function publishFilmEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const film = await db.query.films.findFirst({ where: eq(films.id, id) });
  if (!film) return fail("影片不存在");
  const problems = publishEnProblems({
    titleEn: film.titleEn,
    editorialNoteEn: film.editorialNoteEn,
  });
  if (problems.length) return fail(problems.join("；"));
  await db
    .update(films)
    .set({ statusEn: "published", publishedEnAt: film.publishedEnAt ?? new Date() })
    .where(eq(films.id, id));
  revalidateFilm(film.slug, { notify: film.status === "published" });
  return ok();
}

export async function unpublishFilmEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const film = await db.query.films.findFirst({ where: eq(films.id, id) });
  if (!film) return fail("影片不存在");
  await db.update(films).set({ statusEn: "draft" }).where(eq(films.id, id));
  revalidateFilm(film.slug, { notify: film.status === "published" });
  return ok();
}

export async function unpublishFilm(id: string): Promise<ActionResult> {
  await requireEditor();
  const film = await db.query.films.findFirst({ where: eq(films.id, id) });
  if (!film) return fail("影片不存在");
  await db.update(films).set({ status: "draft" }).where(eq(films.id, id));
  revalidateFilm(film.slug, { notify: film.status === "published" });
  return ok();
}

export async function deleteFilm(id: string): Promise<ActionResult> {
  await requireEditor();
  const film = await db.query.films.findFirst({ where: eq(films.id, id) });
  if (!film) return fail("影片不存在");

  // Every FK to films.id is ON DELETE CASCADE, so a bare delete silently
  // erases reader data — 看过/想看 marks and user-list membership — plus
  // curated-list membership, and it bypasses the "unavailable film"
  // placeholder readers rely on. deleteDirector already guards its
  // cascade; this is the symmetric gate. Draft, unreferenced films still
  // delete freely.
  if (film.status === "published") {
    return fail("影片已发布，请先下架再删除");
  }
  const [{ lists }] = await db
    .select({ lists: count() })
    .from(curatedListItems)
    .where(eq(curatedListItems.filmId, id));
  const [{ userLists }] = await db
    .select({ userLists: count() })
    .from(userListItems)
    .where(eq(userListItems.filmId, id));
  const [{ marks }] = await db
    .select({ marks: count() })
    .from(userMarks)
    .where(eq(userMarks.filmId, id));
  if (lists + userLists + marks > 0) {
    const parts = [
      lists > 0 && `${lists} 个片单`,
      userLists > 0 && `${userLists} 个用户清单`,
      marks > 0 && `${marks} 条用户标记`,
    ].filter(Boolean);
    return fail(`影片仍被 ${parts.join("、")}引用，删除会一并清除这些数据；请先移除引用`);
  }

  await db.delete(films).where(eq(films.id, id));
  // Only drafts reach here (published films are refused above), so there
  // is no public URL to notify — but still invalidate, since an admin
  // preview or a stale listing could reference it.
  revalidateFilm(film.slug);
  return ok();
}
