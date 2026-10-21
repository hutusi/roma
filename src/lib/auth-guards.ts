import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { type Locale, localePath } from "@/i18n/locales";
import { auth } from "@/lib/auth";
import { signInHrefFor } from "@/lib/safe-next";

export type Role = "admin" | "editor" | "user";

/**
 * Session lookup, cached per request. These guards are the real
 * authorization layer: call one at the top of every admin/user page AND
 * every mutating server action. proxy.ts only does a cookie-existence
 * redirect for UX, and layouts don't re-run on soft navigation.
 */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

export function roleOf(session: Awaited<ReturnType<typeof getSession>>): Role {
  const role = session?.user?.role;
  return role === "admin" || role === "editor" ? role : "user";
}

type Session = NonNullable<Awaited<ReturnType<typeof getSession>>>;

/**
 * For pages. `next` is where sign-in returns the reader — pass the
 * page's own path, or they land on the home page and have to find their
 * way back.
 */
export async function requireUser(locale: Locale = "zh", next?: string) {
  const session = await getSession();
  // Send an /en visitor to /en/sign-in so the sign-in round-trip stays
  // in their locale; admin/editor guards below stay zh (admin is zh-only).
  if (!session) {
    const signIn = localePath(locale, "/sign-in");
    redirect(next ? signInHrefFor(signIn, next) : signIn);
  }
  return session;
}

export async function requireEditor(next?: string) {
  const session = await requireUser("zh", next);
  if (roleOf(session) === "user") redirect("/zh");
  return session;
}

export async function requireAdmin(next?: string) {
  const session = await requireUser("zh", next);
  if (roleOf(session) !== "admin") redirect("/admin");
  return session;
}

/**
 * The same checks for server actions, as results instead of redirects.
 * A redirect from an action navigates the client away — the editor's
 * unsaved form, the owner's half-typed title — so actions that hold
 * unsaved work return a failure the UI can explain instead. Codes are
 * stable so UIs can map them to their own copy.
 */
export type Guarded = { ok: true; session: Session } | { ok: false; error: GuardError };
export type GuardError = "sessionExpired" | "forbidden";

export async function requireUserResult(): Promise<Guarded> {
  const session = await getSession();
  return session ? { ok: true, session } : { ok: false, error: "sessionExpired" };
}

export async function requireEditorResult(): Promise<Guarded> {
  const guarded = await requireUserResult();
  if (guarded.ok && roleOf(guarded.session) === "user") return { ok: false, error: "forbidden" };
  return guarded;
}
