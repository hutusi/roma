"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { countryToEn, countryToZh } from "@/i18n/countries";
import { counterpartPath, counterpartQuery } from "@/i18n/locales";

/**
 * Link to the same page in the other edition — in the header ("English" /
 * "中文") and the footer ("English Edition" / "中文版"). Labels are
 * written in the TARGET language (a switcher addresses the reader who
 * wants the other edition), so they are literals, not dictionary keys.
 *
 * The query string comes along — a filtered /films stays filtered, a
 * search keeps its terms — with ?country translated, since it speaks the
 * display language. It is read from location at click time rather than
 * via useSearchParams, which would force a Suspense boundary into the
 * shared chrome; without JS the plain href still lands on the right page.
 */
export function LangToggle({
  labels = { en: "English", zh: "中文" },
  className,
}: {
  labels?: { en: string; zh: string };
  className?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const counterpart = counterpartPath(pathname);
  if (!counterpart) return null;
  return (
    <Link
      href={counterpart.href}
      lang={counterpart.target === "en" ? "en" : "zh-CN"}
      onClick={(event) => {
        if (!window.location.search || event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        const map = counterpart.target === "en" ? countryToEn : countryToZh;
        router.push(counterpart.href + counterpartQuery(window.location.search, map));
      }}
      // Replaces the default classes rather than merging (no tailwind-merge
      // in the layout chunk); the footer passes its own full set.
      className={
        className ??
        "whitespace-nowrap text-ink-muted text-sm tracking-label transition-colors hover:text-brand"
      }
    >
      {counterpart.target === "en" ? labels.en : labels.zh}
    </Link>
  );
}
