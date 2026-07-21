"use server";

import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { lockFilm, lockPeople, lockTags } from "@/db/locks";
import type { TiptapDoc } from "@/db/schema";
import {
  curatedListItems,
  directorViewingItems,
  filmCast,
  filmDirectors,
  films,
  filmTags,
  filmWatchLinks,
  userListItems,
  userMarks,
} from "@/db/schema";
import { requireEditor } from "@/lib/auth-guards";
import { unpublishEmptiedLists } from "@/lib/list-invariants";
import { revalidateFilm, revalidateList } from "@/lib/revalidate";
import {
  type FilmFormValues,
  filmFormSchema,
  parseCountries,
  publishEnProblems,
  publishProblems,
} from "@/lib/validators/film";
import { type ActionResult, fail, ok } from "./result";

function hasSlug<T extends { slug?: string }>(value: T): value is T & { slug: string } {
  return typeof value.slug === "string";
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

/**
 * films now carries several unique columns (slug + external ids), so a
 * 23505 must name the one that collided instead of blaming the slug.
 */
function uniqueViolationMessage(error: unknown, slug: string): string {
  const constraint =
    typeof error === "object" && error !== null && "constraint" in error
      ? ((error as { constraint?: string }).constraint ?? "")
      : "";
  if (constraint.includes("tmdbId")) return "该 TMDB ID 已被其他影片使用";
  if (constraint.includes("imdbId")) return "该 IMDb ID 已被其他影片使用";
  if (constraint.includes("doubanId")) return "该豆瓣 ID 已被其他影片使用";
  return `slug「${slug}」已被使用`;
}

function isForeignKeyViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23503"
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
    isSilent: v.isSilent,
    tmdbId: v.tmdbId?.trim() ? Number(v.tmdbId.trim()) : null,
    imdbId: v.imdbId?.trim() || null,
    doubanId: v.doubanId?.trim() || null,
    wikidataId: v.wikidataId?.trim().toUpperCase() || null,
    restorationNote: v.restorationNote || null,
    restorationNoteEn: v.restorationNoteEn || null,
    editorialNote: v.editorialNote || null,
    essay: (v.essay as TiptapDoc) ?? null,
    editorialNoteEn: v.editorialNoteEn || null,
    essayEn: (v.essayEn as TiptapDoc) ?? null,
  };

  try {
    const outcome = await db.transaction(async (tx) => {
      // One sorted multi-row lock over every referenced person (directing
      // credits + linked cast rows) keeps the people → films order and
      // closes the FK race with deletePerson.
      const linkedPersonIds = [
        ...v.directorIds,
        ...v.cast.flatMap((m) => (m.personId ? [m.personId] : [])),
      ];
      const lockedPeople = await lockPeople(tx, linkedPersonIds);
      if (lockedPeople.length !== new Set(linkedPersonIds).size) {
        return { error: "关联的人物不存在，可能已被删除" } as const;
      }
      // people → tags → films: tags lock second, closing the FK race
      // with deleteTag the same way the people locks close deletePerson's.
      const lockedTags = await lockTags(tx, v.tagIds);
      if (lockedTags.length !== new Set(v.tagIds).size) {
        return { error: "关联的标签不存在，可能已被删除" } as const;
      }

      let targetId = id;
      const existing = targetId ? await lockFilm(tx, targetId) : undefined;
      if (targetId && !existing) return { error: "影片不存在，可能已被删除" } as const;
      const previousSlug = existing?.slug;
      const isPublic = existing?.status === "published";

      if (isPublic) {
        const problems = publishProblems({
          editorialNote: v.editorialNote || null,
          directorCount: v.directorIds.length,
        });
        if (problems.length) {
          return {
            error: `影片已发布，不能存为不可发布的状态：${problems.join("；")}`,
          } as const;
        }
      }
      if (existing?.statusEn === "published") {
        const problems = publishEnProblems({
          titleEn: v.titleEn || null,
          editorialNoteEn: v.editorialNoteEn || null,
        });
        if (problems.length) {
          return {
            error: `英文版已发布，不能存为不可发布的状态：${problems.join("；")}`,
          } as const;
        }
      }

      if (targetId) {
        await tx.update(films).set(row).where(eq(films.id, targetId));
        await tx.delete(filmWatchLinks).where(eq(filmWatchLinks.filmId, targetId));
        await tx.delete(filmDirectors).where(eq(filmDirectors.filmId, targetId));
        await tx.delete(filmCast).where(eq(filmCast.filmId, targetId));
        await tx.delete(filmTags).where(eq(filmTags.filmId, targetId));
      } else {
        const [created] = await tx.insert(films).values(row).returning({ id: films.id });
        targetId = created.id;
      }
      if (v.cast.length) {
        await tx.insert(filmCast).values(
          v.cast.map((m, i) => ({
            filmId: targetId,
            position: i,
            name: m.name,
            nameZh: m.nameZh || null,
            character: m.character || null,
            characterZh: m.characterZh || null,
            personId: m.personId || null,
          })),
        );
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
      if (v.tagIds.length) {
        await tx.insert(filmTags).values(v.tagIds.map((tagId) => ({ filmId: targetId, tagId })));
      }
      return { id: targetId, previousSlug, isPublic } as const;
    });
    if ("error" in outcome && outcome.error) return fail(outcome.error);
    const { id: filmId, previousSlug, isPublic } = outcome;
    revalidateFilm(v.slug, { notify: isPublic });
    if (isPublic && previousSlug && previousSlug !== v.slug) {
      revalidateFilm(previousSlug, { notify: true });
    }
    return ok({ id: filmId });
  } catch (error) {
    if (isUniqueViolation(error)) return fail(uniqueViolationMessage(error, v.slug));
    if (isForeignKeyViolation(error)) return fail("关联的人物或标签不存在，可能已被删除");
    throw error;
  }
}

export async function publishFilm(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const film = await lockFilm(tx, id);
    if (!film) return { error: "影片不存在" } as const;
    const [{ n: directorCount }] = await tx
      .select({ n: count() })
      .from(filmDirectors)
      .where(eq(filmDirectors.filmId, id));
    const problems = publishProblems({ editorialNote: film.editorialNote, directorCount });
    if (problems.length) return { error: problems.join("；") } as const;
    await tx
      .update(films)
      .set({ status: "published", publishedAt: film.publishedAt ?? new Date() })
      .where(eq(films.id, id));
    return { slug: film.slug } as const;
  });
  if (!hasSlug(outcome)) return fail(outcome.error ?? "影片操作失败");
  revalidateFilm(outcome.slug, { notify: true });
  return ok();
}

export async function publishFilmEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const film = await lockFilm(tx, id);
    if (!film) return { error: "影片不存在" } as const;
    const problems = publishEnProblems({
      titleEn: film.titleEn,
      editorialNoteEn: film.editorialNoteEn,
    });
    if (problems.length) return { error: problems.join("；") } as const;
    await tx
      .update(films)
      .set({ statusEn: "published", publishedEnAt: film.publishedEnAt ?? new Date() })
      .where(eq(films.id, id));
    return { slug: film.slug, isPublic: film.status === "published" } as const;
  });
  if (!hasSlug(outcome)) return fail(outcome.error ?? "影片操作失败");
  revalidateFilm(outcome.slug, { notify: outcome.isPublic });
  return ok();
}

export async function unpublishFilmEn(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const film = await lockFilm(tx, id);
    if (!film) return null;
    await tx.update(films).set({ statusEn: "draft" }).where(eq(films.id, id));
    return { slug: film.slug, isPublic: film.status === "published" };
  });
  if (!outcome) return fail("影片不存在");
  revalidateFilm(outcome.slug, { notify: outcome.isPublic });
  return ok();
}

export async function unpublishFilm(id: string): Promise<ActionResult> {
  await requireEditor();
  const outcome = await db.transaction(async (tx) => {
    const film = await lockFilm(tx, id);
    if (!film) return null;
    await tx.update(films).set({ status: "draft" }).where(eq(films.id, id));
    const emptiedLists = await unpublishEmptiedLists(tx, id);
    return { slug: film.slug, wasPublic: film.status === "published", emptiedLists };
  });
  if (!outcome) return fail("影片不存在");
  revalidateFilm(outcome.slug, { notify: outcome.wasPublic });
  for (const list of outcome.emptiedLists) {
    revalidateList(list.slug, { notify: list.wasPublic });
  }
  return ok();
}

export async function deleteFilm(id: string): Promise<ActionResult> {
  await requireEditor();
  try {
    const outcome = await db.transaction(async (tx) => {
      const film = await lockFilm(tx, id);
      if (!film) return { error: "影片不存在" } as const;
      if (film.status === "published") return { error: "影片已发布，请先下架再删除" } as const;

      const [{ lists }] = await tx
        .select({ lists: count() })
        .from(curatedListItems)
        .where(eq(curatedListItems.filmId, id));
      const [{ viewingOrders }] = await tx
        .select({ viewingOrders: count() })
        .from(directorViewingItems)
        .where(eq(directorViewingItems.filmId, id));
      const [{ userLists }] = await tx
        .select({ userLists: count() })
        .from(userListItems)
        .where(eq(userListItems.filmId, id));
      const [{ marks }] = await tx
        .select({ marks: count() })
        .from(userMarks)
        .where(eq(userMarks.filmId, id));
      if (lists + viewingOrders + userLists + marks > 0) {
        const parts = [
          lists > 0 && `${lists} 个片单`,
          viewingOrders > 0 && `${viewingOrders} 个导演观看顺序`,
          userLists > 0 && `${userLists} 个用户清单`,
          marks > 0 && `${marks} 条用户标记`,
        ].filter(Boolean);
        return { error: `影片仍被 ${parts.join("、")}引用，请先移除引用` } as const;
      }
      await tx.delete(films).where(eq(films.id, id));
      return { slug: film.slug } as const;
    });
    if ("error" in outcome && outcome.error) return fail(outcome.error);
    revalidateFilm(outcome.slug);
    return ok();
  } catch (error) {
    if (isForeignKeyViolation(error)) return fail("影片仍被其他内容引用，请刷新后移除引用");
    throw error;
  }
}
