"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * A header link that knows when its section is on screen — /lists also
 * owns /list/…, /films owns /film/… — and says so with aria-current, which
 * the styles key off.
 */
export function NavLink({
  href,
  sections,
  ...props
}: ComponentProps<typeof Link> & { href: string; sections: string[] }) {
  const pathname = usePathname();
  const current = sections.some((s) => pathname === s || pathname.startsWith(`${s}/`));
  return <Link href={href} aria-current={current ? "page" : undefined} {...props} />;
}
