"use client";

import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LangToggle } from "@/components/site/lang-toggle";
import { NavLink } from "@/components/site/nav-link";
import { notifyError } from "@/components/site/notify";
import { signOut } from "@/components/site/sign-out";
import { useMe } from "@/components/site/use-me";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import { signInHrefFor } from "@/lib/safe-next";

export type NavItem = { href: string; label: string; sections: string[] };

const ROW =
  "block border-line border-b py-3 tracking-label transition-colors hover:text-brand aria-[current=page]:text-brand";

/**
 * The header's small-screen menu: a disclosure (button + panel), not a
 * Radix sheet, so nothing heavy joins the layout chunk. It carries what
 * the desktop header shows inline — sections, account, language — as
 * full-width rows sized for thumbs. Escape, a click outside and any
 * navigation close it; focus returns to the button on Escape.
 */
export function MobileMenu({
  locale,
  nav,
  labels,
  authLabels,
}: {
  locale: Locale;
  nav: NavItem[];
  labels: Dictionary["nav"];
  authLabels: Dictionary["authMenu"];
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { status, user } = useMe();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Any navigation closes the menu (state-during-render, not an effect).
  const [openedAt, setOpenedAt] = useState(pathname);
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const onSignOut = async () => {
    if (!(await signOut())) {
      notifyError(authLabels.signOutFailed);
      return;
    }
    setOpen(false);
    router.refresh();
  };

  const signInHref = signInHrefFor(localePath(locale, "/sign-in"), pathname);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="-mr-2 p-2 text-ink transition-colors hover:text-brand"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? labels.closeMenu : labels.menu}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <XIcon className="size-5" aria-hidden />
        ) : (
          <MenuIcon className="size-5" aria-hidden />
        )}
      </button>
      {open && (
        <div
          ref={panelRef}
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-40 animate-fade-up border-line border-b bg-paper px-4 pb-4 shadow-sm"
        >
          <nav aria-label={labels.label}>
            {nav.map((item) => (
              <NavLink key={item.href} href={item.href} sections={item.sections} className={ROW}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="text-ink-muted">
            {user ? (
              <>
                {user.username && (
                  <Link href={localePath(locale, `/u/${user.username}`)} className={ROW}>
                    {authLabels.myPage}
                  </Link>
                )}
                <Link href={localePath(locale, "/me/follows")} className={ROW}>
                  {authLabels.follows}
                </Link>
                <Link href={localePath(locale, "/account")} className={ROW}>
                  {authLabels.account}
                </Link>
                {(user.role === "admin" || user.role === "editor") && (
                  <Link href="/admin" className={ROW}>
                    {authLabels.editorial}
                  </Link>
                )}
                <button
                  type="button"
                  className={`${ROW} w-full text-left`}
                  onClick={() => void onSignOut()}
                >
                  {authLabels.signOut}
                </button>
              </>
            ) : (
              status !== "loading" && (
                <Link href={signInHref} className={ROW}>
                  {authLabels.signIn}
                </Link>
              )
            )}
          </div>
          <div className="pt-3">
            <LangToggle />
          </div>
        </div>
      )}
    </>
  );
}
