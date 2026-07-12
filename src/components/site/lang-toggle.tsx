"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { counterpartPath } from "@/i18n/locales";

/**
 * Header link to the same page in the other locale. Label literals are
 * deliberate: a switcher labels itself in the TARGET language (the
 * LocaleSwitch precedent), so the current locale's dictionary is the
 * wrong tool — and locale-invariant literals keep this island
 * prop-free. No useSearchParams: queries are dropped by design
 * (counterpartPath), and it would force a Suspense boundary into the
 * shared chrome.
 */
export function LangToggle() {
  const pathname = usePathname();
  const counterpart = counterpartPath(pathname);
  if (!counterpart) return null;
  return (
    <Link
      href={counterpart.href}
      className="text-ink-muted text-sm tracking-[0.2em] transition-colors hover:text-brand"
    >
      {counterpart.target === "en" ? "English" : "中文"}
    </Link>
  );
}
