import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listFollows, userMarks } from "@/db/schema";
import { getSession, roleOf } from "@/lib/auth-guards";

const NO_STORE = { "Cache-Control": "no-store" };

/**
 * Per-user state for the client islands on SSG pages: who is signed in
 * (header menu, language hint) plus the mark / follow for the film or
 * list on screen. The cached page HTML never contains user state; this
 * endpoint is the only per-user read, it must never be cached, and it is
 * the only session read a public page makes — getSession here also
 * slides the session cookie forward (better-auth's nextCookies plugin
 * writes the refreshed cookie from a route handler), the job the
 * client's /api/auth/get-session used to do on every page.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const filmId = request.nextUrl.searchParams.get("filmId");
    const listId = request.nextUrl.searchParams.get("listId");

    if (!session) {
      return NextResponse.json({ user: null, mark: null, following: false }, { headers: NO_STORE });
    }

    const [mark, follow] = await Promise.all([
      filmId
        ? db.query.userMarks.findFirst({
            where: and(eq(userMarks.userId, session.user.id), eq(userMarks.filmId, filmId)),
          })
        : null,
      listId
        ? db.query.listFollows.findFirst({
            where: and(eq(listFollows.userId, session.user.id), eq(listFollows.listId, listId)),
          })
        : null,
    ]);

    const user = session.user as typeof session.user & {
      username?: string | null;
      locale?: string | null;
    };
    return NextResponse.json(
      {
        user: {
          // Identity, so the client store can tell one reader from the next.
          id: user.id,
          name: user.name,
          username: user.username ?? null,
          role: roleOf(session),
          locale: user.locale === "zh" || user.locale === "en" ? user.locale : null,
        },
        mark: mark?.status ?? null,
        following: Boolean(follow),
      },
      { headers: NO_STORE },
    );
  } catch (error) {
    // The islands treat this as "unknown", never as "signed out".
    console.error("[api/me/state]", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: NO_STORE });
  }
}
