import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type Role = "admin" | "editor" | "user";

/**
 * Session lookup, cached per request. These guards are the real
 * authorization layer: call one at the top of every admin/user page AND
 * every mutating server action. proxy.ts only does a cookie-existence
 * redirect for UX, and layouts don't re-run on soft navigation.
 */
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export function roleOf(
  session: Awaited<ReturnType<typeof getSession>>,
): Role {
  const role = session?.user?.role;
  return role === "admin" || role === "editor" ? role : "user";
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  return session;
}

export async function requireEditor() {
  const session = await requireUser();
  if (roleOf(session) === "user") redirect("/");
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (roleOf(session) !== "admin") redirect("/admin");
  return session;
}
