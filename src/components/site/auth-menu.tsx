"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMe } from "@/components/site/use-me";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import { signInHrefFor } from "@/lib/safe-next";
import type { AuthMenuDropdown as AuthMenuDropdownType } from "./auth-menu-dropdown";

type Dropdown = typeof AuthMenuDropdownType;

// Radix DropdownMenu (and floating-ui) load only once someone is signed
// in; a signed-out reader gets a plain link. Not React.lazy: a rejected
// lazy() rethrows on every render, and this header sits in the root
// layout, so a dropdown chunk that failed to load (a tab left open across
// a deploy, a flaky connection) took the whole page down to the global
// error screen. A failed load is forgotten, so the next mount retries.
let dropdownLoad: Promise<Dropdown> | null = null;
function loadDropdown(): Promise<Dropdown> {
  dropdownLoad ??= import("./auth-menu-dropdown").then(
    (m) => m.AuthMenuDropdown,
    (error) => {
      dropdownLoad = null;
      throw error;
    },
  );
  return dropdownLoad;
}

/**
 * Header auth entry. A client island reading the shared useMe store, so
 * the header can live on fully static pages. Labels arrive as props
 * (dictionaries are server-only).
 */
export function AuthMenu({ locale, labels }: { locale: Locale; labels: Dictionary["authMenu"] }) {
  const { status, user } = useMe();
  const pathname = usePathname();
  const [Dropdown, setDropdown] = useState<Dropdown | null>(null);
  const [failed, setFailed] = useState(false);
  const signedIn = Boolean(user);

  useEffect(() => {
    if (!signedIn || Dropdown) return;
    let live = true;
    loadDropdown().then(
      (loaded) => live && setDropdown(() => loaded),
      () => live && setFailed(true),
    );
    return () => {
      live = false;
    };
  }, [signedIn, Dropdown]);

  // Fixed footprint while unknown, so the nav doesn't jump when it resolves.
  if (status === "loading" && !user) {
    return <span className="inline-block w-10" aria-hidden />;
  }

  // Signed out — or unknown after a failed read: the sign-in page is the
  // useful place to land either way.
  if (!user) {
    return (
      <Link
        // Back to this page afterwards, not the home page (and from an
        // auth page, no next at all: see signInHrefFor).
        href={signInHrefFor(localePath(locale, "/sign-in"), pathname)}
        className="whitespace-nowrap text-sm tracking-label transition-colors hover:text-brand"
      >
        {labels.signIn}
      </Link>
    );
  }

  if (Dropdown) return <Dropdown locale={locale} labels={labels} user={user} />;

  // Until the dropdown arrives the name holds its place, so the header
  // doesn't shift. If it can't arrive, the name links to the account page:
  // a full load there brings the current deployment's chunks, menu included.
  const NAME = "max-w-[7rem] truncate text-sm tracking-title lg:max-w-[10rem]";
  return failed ? (
    <Link href={localePath(locale, "/account")} className={`${NAME} hover:text-brand`}>
      {user.name}
    </Link>
  ) : (
    <span className={NAME}>{user.name}</span>
  );
}
