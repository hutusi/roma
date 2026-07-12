import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./locales";

/**
 * Narrows the [lang] route param to a Locale. dynamicParams=false on the
 * [lang] layout already makes other values unreachable, but that
 * guarantee lives in a different file — every server file under
 * app/[lang] calls this once at the top so drift degrades to a 404
 * instead of mislabeled content. (Kept out of locales.ts so that module
 * stays importable from client components and plain unit tests.)
 */
export function parseLocale(lang: string): Locale {
  if (!isLocale(lang)) notFound();
  return lang;
}
