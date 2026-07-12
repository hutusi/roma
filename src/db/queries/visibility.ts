import type { Locale } from "@/i18n/locales";

/**
 * The en-subset rule as one pure predicate: a row is visible in a locale
 * when it is published in zh AND — for en — also published in en. So /en
 * can never surface what zh hasn't (en ⊆ zh), and drafts stay hidden in
 * both. Rows must carry both status columns.
 *
 * Deliberately free of "server-only" / db imports so the rule can be
 * unit-tested in isolation and reused by both the query layer (public.ts)
 * and any renderer that degrades untranslated members.
 */
export function visibleIn(row: { status: string; statusEn: string }, locale: Locale): boolean {
  return row.status === "published" && (locale !== "en" || row.statusEn === "published");
}
