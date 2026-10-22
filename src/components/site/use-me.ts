"use client";

import { useEffect, useSyncExternalStore } from "react";

export type MeUser = {
  id: string;
  name: string;
  username: string | null;
  role: "admin" | "editor" | "user";
  locale: "zh" | "en" | null;
};
export type MarkStatus = "watched" | "want";

/**
 * - loading: no answer yet (first paint, or after an invalidation)
 * - ready:   the server answered; `user` is null when signed out
 * - error:   the request failed — the reader's state is UNKNOWN, which
 *            islands must never render as "signed out"
 */
export type MeStatus = "loading" | "ready" | "error";

type Snapshot = {
  status: MeStatus;
  user: MeUser | null;
  marks: Readonly<Record<string, MarkStatus | null>>;
  follows: Readonly<Record<string, boolean>>;
};

const TIMEOUT_MS = 8_000;
const REFRESH_AFTER_MS = 30_000;

// Module-level store: one session read per page, shared by the header
// menu, the language hint and the mark / follow islands. Pages carry at
// most one film and one list, so the request names at most one of each.
let snapshot: Snapshot = { status: "loading", user: null, marks: {}, follows: {} };
const listeners = new Set<() => void>();
const wantedFilms = new Map<string, number>();
const wantedLists = new Map<string, number>();
let scheduled = false;
let inflight: AbortController | null = null;
let lastFetched = 0;
// Whom the cached marks and follows belong to: undefined before the
// first answer, null when that answer was "signed out".
let cachedFor: string | null | undefined;

function emit(next: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...next };
  for (const listener of listeners) listener();
}

/**
 * The id a request should ask about: the newest wanted one that has no
 * answer yet, else simply the newest. Asking for unanswered ids first is
 * what lets the follow-up requests in load() run out.
 */
function toAsk(wanted: Map<string, number>, answered: Readonly<Record<string, unknown>>) {
  const ids = [...wanted.keys()];
  for (let i = ids.length - 1; i >= 0; i--) if (!(ids[i] in answered)) return ids[i];
  return ids.at(-1);
}

const unanswered = (wanted: Map<string, number>, answered: Readonly<Record<string, unknown>>) =>
  [...wanted.keys()].some((id) => !(id in answered));

async function load() {
  scheduled = false;
  inflight?.abort();
  const controller = new AbortController();
  inflight = controller;
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const filmId = toAsk(wantedFilms, snapshot.marks);
  const listId = toAsk(wantedLists, snapshot.follows);
  const params = new URLSearchParams();
  if (filmId) params.set("filmId", filmId);
  if (listId) params.set("listId", listId);
  try {
    const res = await fetch(`/api/me/state${params.size ? `?${params}` : ""}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`me/state ${res.status}`);
    const data = (await res.json()) as {
      user: MeUser | null;
      mark: MarkStatus | null;
      following: boolean;
    };
    if (inflight !== controller) return;
    lastFetched = Date.now();
    // A refresh can answer for someone else: the account changed in
    // another tab or on a shared machine, which this tab never saw. What
    // was cached for the last reader must not carry over, or a film
    // already visited shows their mark (it isn't re-read once cached).
    const reader = data.user?.id ?? null;
    const sameReader = reader === cachedFor;
    cachedFor = reader;
    const marks = sameReader ? snapshot.marks : {};
    const follows = sameReader ? snapshot.follows : {};
    emit({
      status: "ready",
      user: data.user,
      marks: filmId ? { ...marks, [filmId]: data.mark } : marks,
      follows: listId ? { ...follows, [listId]: data.following } : follows,
    });
    // An island that mounted while this was in flight (soft navigation
    // back to a visited film) found its answer cached and asked for
    // nothing, and a new reader's answer just dropped that cache, leaving
    // it on its placeholder. Ask again for whatever is still unanswered.
    if (unanswered(wantedFilms, snapshot.marks) || unanswered(wantedLists, snapshot.follows)) {
      schedule();
    }
  } catch {
    if (inflight === controller) emit({ status: "error" });
  } finally {
    clearTimeout(timer);
    if (inflight === controller) inflight = null;
  }
}

/** Batch every request made in one tick (layout + page islands mount together). */
function schedule() {
  if (scheduled) return;
  scheduled = true;
  queueMicrotask(load);
}

/**
 * Re-read the session: after sign-in, sign-up, sign-out or an account
 * edit. Everything known about the previous reader is dropped; islands
 * fall back to their placeholders until the server answers.
 */
export function invalidateMe() {
  emit({ status: "loading", user: null, marks: {}, follows: {} });
  schedule();
}

/** Try again after a failed read, keeping what is already known. */
export function retryMe() {
  emit({ status: "loading" });
  schedule();
}

/** Record a mutation the server confirmed, without another round trip. */
export function setMeMark(filmId: string, mark: MarkStatus | null) {
  emit({ marks: { ...snapshot.marks, [filmId]: mark } });
}
export function setMeFollow(listId: string, following: boolean) {
  emit({ follows: { ...snapshot.follows, [listId]: following } });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// A tab left open shouldn't show a session that ended elsewhere.
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && Date.now() - lastFetched > REFRESH_AFTER_MS) {
      schedule();
    }
  });
}

const serverSnapshot: Snapshot = snapshot;

function want(map: Map<string, number>, id: string | undefined) {
  if (!id) return () => {};
  map.set(id, (map.get(id) ?? 0) + 1);
  return () => {
    const n = (map.get(id) ?? 1) - 1;
    if (n > 0) map.set(id, n);
    else map.delete(id);
  };
}

/**
 * The signed-in reader, plus — when asked — their mark on `filmId` or
 * follow of `listId`. The first caller triggers the request; later ones
 * with a new film or list trigger one more (soft navigation).
 */
export function useMe({ filmId, listId }: { filmId?: string; listId?: string } = {}) {
  const state = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => serverSnapshot,
  );

  useEffect(() => {
    const releaseFilm = want(wantedFilms, filmId);
    const releaseList = want(wantedLists, listId);
    const needsFilm = filmId !== undefined && !(filmId in snapshot.marks);
    const needsList = listId !== undefined && !(listId in snapshot.follows);
    if (lastFetched === 0 || needsFilm || needsList) schedule();
    return () => {
      releaseFilm();
      releaseList();
    };
  }, [filmId, listId]);

  // A film or list this snapshot hasn't answered for yet reads as loading.
  const pendingFor =
    (filmId !== undefined && !(filmId in state.marks)) ||
    (listId !== undefined && !(listId in state.follows));
  return {
    status: state.status === "ready" && pendingFor ? ("loading" as const) : state.status,
    user: state.user,
    mark: filmId ? (state.marks[filmId] ?? null) : null,
    following: listId ? (state.follows[listId] ?? false) : false,
    retry: retryMe,
  };
}
