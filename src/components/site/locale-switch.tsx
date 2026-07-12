import Link from "next/link";
import { type Locale, localePath } from "@/i18n/locales";

/**
 * Link to the same page in the other locale. The label is written in
 * the *target* language (switcher convention). Every published page has
 * a counterpart URL — an untranslated entity resolves to a
 * translation-pending stub on /en (ADR 0012) — so callers render this
 * unconditionally on published pages.
 */
export function LocaleSwitch({
  locale,
  path,
  className,
}: {
  locale: Locale;
  /** Canonical (locale-less) path, e.g. "/film/otto-e-mezzo". */
  path: string;
  className?: string;
}) {
  const toEn = locale === "zh";
  return (
    <Link
      href={localePath(toEn ? "en" : "zh", path)}
      className={
        className ?? "text-ink-muted text-xs tracking-[0.2em] transition-colors hover:text-brand"
      }
    >
      {toEn ? "English Edition" : "中文版"}
    </Link>
  );
}
