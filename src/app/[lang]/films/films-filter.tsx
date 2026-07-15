"use client";

import { useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n/locales";
import { type FilmCardData, FilmsView } from "./films-view";

/**
 * Reads ?decade/?country on the client so the page itself can stay
 * static. Reading them on the server (via the searchParams prop) is what
 * made /films the one editorial route rendering dynamically, against
 * ADR 0005 — and it re-queried the whole catalogue per request.
 *
 * Must stay behind a <Suspense> whose fallback renders the same
 * catalogue unfiltered: useSearchParams client-renders everything up to
 * that boundary, so the fallback is what lands in the prerendered HTML,
 * and an empty one would ship /films with no films in it.
 */
export function FilmsFilter({ locale, films }: { locale: Locale; films: FilmCardData[] }) {
  const params = useSearchParams();

  const decadeParam = params.get("decade");
  const parsed = Number(decadeParam);
  const decade = decadeParam && Number.isFinite(parsed) ? parsed : undefined;

  return (
    <FilmsView
      locale={locale}
      films={films}
      selection={{ decade, country: params.get("country") ?? undefined }}
    />
  );
}
