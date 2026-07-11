import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
import { localePath } from "@/i18n/locales";

/**
 * UX-only gate: bounce clearly-signed-out visitors to /sign-in before
 * rendering. This checks cookie existence, not validity — real
 * authorization happens in the auth-guards at page/action level.
 */
export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  if (!sessionCookie) {
    const { pathname } = request.nextUrl;
    const locale = pathname === "/en" || pathname.startsWith("/en/") ? "en" : "zh";
    const signIn = new URL(localePath(locale, "/sign-in"), request.url);
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/me/:path*", "/account", "/en/me/:path*", "/en/account"],
};
