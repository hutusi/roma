import "server-only";
import { asc, eq, inArray } from "drizzle-orm";
import type { db } from "@/db";
import { curatedLists, directors, films, userLists, users } from "@/db/schema";

export type DbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Canonical editorial lock order: directors → films → lists. Callers that
 * need more than one kind must follow it; multi-row helpers sort by id so
 * two requests cannot acquire the same set in opposite order.
 */
export async function lockDirector(tx: DbTransaction, id: string) {
  const [row] = await tx.select().from(directors).where(eq(directors.id, id)).for("update");
  return row;
}

export async function lockDirectors(tx: DbTransaction, ids: string[]) {
  const uniqueIds = [...new Set(ids)].sort();
  if (uniqueIds.length === 0) return [];
  return tx
    .select({ id: directors.id })
    .from(directors)
    .where(inArray(directors.id, uniqueIds))
    .orderBy(asc(directors.id))
    .for("update");
}

export async function lockFilm(tx: DbTransaction, id: string) {
  const [row] = await tx.select().from(films).where(eq(films.id, id)).for("update");
  return row;
}

export async function lockFilms(tx: DbTransaction, ids: string[]) {
  const uniqueIds = [...new Set(ids)].sort();
  if (uniqueIds.length === 0) return [];
  return tx
    .select()
    .from(films)
    .where(inArray(films.id, uniqueIds))
    .orderBy(asc(films.id))
    .for("update");
}

export async function lockCuratedList(tx: DbTransaction, id: string) {
  const [row] = await tx.select().from(curatedLists).where(eq(curatedLists.id, id)).for("update");
  return row;
}

export async function lockCuratedLists(tx: DbTransaction, ids: string[]) {
  const uniqueIds = [...new Set(ids)].sort();
  if (uniqueIds.length === 0) return [];
  return tx
    .select()
    .from(curatedLists)
    .where(inArray(curatedLists.id, uniqueIds))
    .orderBy(asc(curatedLists.id))
    .for("update");
}

export async function lockUserList(tx: DbTransaction, id: string) {
  const [row] = await tx.select().from(userLists).where(eq(userLists.id, id)).for("update");
  return row;
}

export async function lockUser(tx: DbTransaction, id: string) {
  const [row] = await tx.select().from(users).where(eq(users.id, id)).for("update");
  return row;
}
