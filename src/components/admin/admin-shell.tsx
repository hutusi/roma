"use client";

import { MenuIcon, XIcon } from "lucide-react";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { type ReactNode, useState } from "react";
import { GuardedLink } from "@/components/admin/dirty-guard";

export type AdminNavItem = { href: string; label: string };

const LINK =
  "block rounded px-2 py-1.5 transition-colors hover:bg-accent hover:text-brand aria-[current=page]:bg-accent aria-[current=page]:font-bold aria-[current=page]:text-ink";

/**
 * The editorial desk's frame: a sidebar from `md` up, a top bar with a
 * drawer below it (the fixed 208px sidebar left phones a sliver of
 * form). The current section is marked. Previews drop the frame entirely
 * so they render in the public site's own chrome.
 */
export function AdminShell({
  nav,
  account,
  children,
}: {
  nav: AdminNavItem[];
  /** Who is signed in, and sign-out — rendered in the sidebar and the drawer. */
  account: ReactNode;
  children: ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Any navigation closes the drawer (state-during-render, not an effect).
  const [openedAt, setOpenedAt] = useState(pathname);
  if (openedAt !== pathname) {
    setOpenedAt(pathname);
    setOpen(false);
  }

  if (segment === "preview") return <>{children}</>;

  const current = (href: string) =>
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);
  const links = (
    <nav aria-label="编辑部导航" className="flex flex-col gap-1">
      {nav.map(({ href, label }) => (
        <GuardedLink
          key={href}
          href={href}
          aria-current={current(href) ? "page" : undefined}
          className={LINK}
        >
          {label}
        </GuardedLink>
      ))}
    </nav>
  );
  const brand = (
    <GuardedLink href="/admin" className="px-2 font-bold tracking-label">
      八部半 · 编辑部
    </GuardedLink>
  );

  return (
    <div className="flex min-h-full flex-1 flex-col font-sans text-ui md:flex-row">
      <header className="relative flex items-center justify-between border-line border-b bg-secondary/40 px-4 py-3 md:hidden">
        {brand}
        <button
          type="button"
          className="-mr-2 p-2"
          aria-expanded={open}
          aria-controls="admin-drawer"
          aria-label={open ? "关闭菜单" : "菜单"}
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
            id="admin-drawer"
            className="absolute inset-x-0 top-full z-40 space-y-4 border-line border-b bg-paper px-4 py-4 shadow-sm"
          >
            {links}
            <div className="border-line border-t pt-3 text-sm">{account}</div>
          </div>
        )}
      </header>
      <aside className="hidden w-52 shrink-0 flex-col border-line border-r bg-secondary/40 px-4 py-6 md:flex">
        {brand}
        <div className="mt-8 flex-1">{links}</div>
        <div className="border-line border-t pt-4 text-sm">{account}</div>
      </aside>
      <div className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</div>
    </div>
  );
}
