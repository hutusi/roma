"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { lazy, Suspense } from "react";
import { useMe } from "@/components/site/use-me";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import { signInHrefFor } from "@/lib/safe-next";

// Radix DropdownMenu (and floating-ui) load only once someone is signed
// in; a signed-out reader gets a plain link. Until the chunk arrives the
// name renders in the trigger's place, so the header doesn't shift.
const AuthMenuDropdown = lazy(() =>
  import("./auth-menu-dropdown").then((m) => ({ default: m.AuthMenuDropdown })),
);

/**
 * Header auth entry. A client island reading the shared useMe store, so
 * the header can live on fully static pages. Labels arrive as props
 * (dictionaries are server-only).
 */
export function AuthMenu({ locale, labels }: { locale: Locale; labels: Dictionary["authMenu"] }) {
  const { status, user } = useMe();
  const pathname = usePathname();

  // Fixed footprint while unknown, so the nav doesn't jump when it resolves.
  if (status === "loading" && !user) {
    return <span className="inline-block w-10" aria-hidden />;
  }

  // Signed out — or unknown after a failed read: the sign-in page is the
  // useful place to land either way.
  if (!user) {
    return (
      <Link
        // Back to this page afterwards, not the home page. The sign-in
        // pages themselves carry no next (it would point at sign-in).
        href={
          /\/(sign-in|sign-up|forgot-password|reset-password)$/.test(pathname)
            ? localePath(locale, "/sign-in")
            : signInHrefFor(localePath(locale, "/sign-in"), pathname)
        }
        className="whitespace-nowrap text-sm tracking-label transition-colors hover:text-brand"
      >
        {labels.signIn}
      </Link>
    );
  }

  return (
    <Suspense
      fallback={<span className="max-w-[10rem] truncate text-sm tracking-title">{user.name}</span>}
    >
      <AuthMenuDropdown locale={locale} labels={labels} user={user} />
    </Suspense>
  );
}
