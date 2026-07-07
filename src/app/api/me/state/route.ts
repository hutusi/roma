import { and, eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { listFollows, userMarks } from "@/db/schema";
import { getSession } from "@/lib/auth-guards";

/**
 * Per-user state for the client islands on SSG pages (mark buttons,
 * follow button). The cached page HTML never contains user state; this
 * endpoint is the only per-user read, and it must never be cached.
 */
export async function GET(request: NextRequest) {
  const session = await getSession();
  const filmId = request.nextUrl.searchParams.get("filmId");
  const listId = request.nextUrl.searchParams.get("listId");

  if (!session) {
    return NextResponse.json(
      { signedIn: false, mark: null, following: false },
      { headers: { "Cache-Control": "no-store" } },
    );
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

  return NextResponse.json(
    {
      signedIn: true,
      mark: mark?.status ?? null,
      following: Boolean(follow),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
