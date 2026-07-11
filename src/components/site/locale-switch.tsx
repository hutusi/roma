import Link from "next/link";
import { type Locale, localePath } from "@/i18n/locales";

/**
 * Link to the same page in the other locale. The label is written in
 * the *target* language (switcher convention). Callers only render it
 * when the counterpart page actually exists — the subset rule means an
 * en counterpart may not.
 */
export function LocaleSwitch({
  locale,
  path,
  className,
}: {
  locale: Locale;
  /** Canonical (zh) path, e.g. "/film/otto-e-mezzo". */
  path: string;
  className?: string;
}) {
  const toEn = locale === "zh";
  return (
    <Link
      href={toEn ? localePath("en", path) : path}
      className={
        className ?? "text-ink-muted text-xs tracking-[0.2em] transition-colors hover:text-brand"
      }
    >
      {toEn ? "English Edition" : "中文版"}
    </Link>
  );
}
