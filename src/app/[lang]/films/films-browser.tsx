"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { EmptyState } from "@/components/site/empty-state";
import { FilmCard } from "@/components/site/film-card";
import { HOUSE_BUTTON } from "@/components/site/house-button";
import { NativeSelect } from "@/components/ui/native-select";
import { type Locale, localePath } from "@/i18n/locales";
import { COPY } from "./copy";
import {
  decadesOf,
  type FilmCardData,
  filterFilms,
  isFiltered,
  parseSelection,
  type Selection,
  selectionParams,
} from "./filtering";

/**
 * Reports the query to the catalogue whenever Next navigates: on mount,
 * back/forward, and same-page links such as a search result for a tag
 * (/films → /films?tag=…), which keep the page mounted. It renders
 * nothing, and sits in its own Suspense boundary: useSearchParams makes a
 * prerendered page client-render up to the nearest boundary, and around
 * the whole catalogue that used to replace its DOM on hydration and
 * serialise the film data twice.
 */
function QuerySync({ onChange }: { onChange: (selection: Selection) => void }) {
  const params = useSearchParams();
  useEffect(() => onChange(parseSelection(params)), [params, onChange]);
  return null;
}

/**
 * The /films catalogue and its filters, as one island. It renders the
 * whole catalogue on the server (that is the prerendered HTML crawlers
 * and no-JS readers get) and applies ?decade/?country/?palette/?tag only
 * on the client, from the URL (QuerySync).
 *
 * Filters apply as they change; the URL follows (replaceState, so the
 * back button isn't a filter history, and Next syncs it into
 * useSearchParams). The GET form still works without JS.
 */
export function FilmsBrowser({ locale, films }: { locale: Locale; films: FilmCardData[] }) {
  const t = COPY[locale];
  const [selection, setSelection] = useState<Selection>({});

  const update = (next: Selection) => {
    setSelection(next);
    const query = selectionParams(next).toString();
    window.history.replaceState(null, "", `${window.location.pathname}${query ? `?${query}` : ""}`);
  };

  const decades = decadesOf(films);
  const collator = new Intl.Collator(locale === "zh" ? "zh-CN" : "en");
  const countries = [...new Set(films.flatMap((f) => f.countries))].sort(collator.compare);
  // Options come from the films themselves, so no facet offers zero matches.
  const tags = [
    ...new Map(films.flatMap((f) => f.tags).map((tag) => [tag.slug, tag])).values(),
  ].sort((a, b) => collator.compare(a.label, b.label));
  const shown = filterFilms(films, selection);
  const filtered = isFiltered(selection);

  return (
    <>
      <Suspense fallback={null}>
        <QuerySync onChange={setSelection} />
      </Suspense>
      <form
        className="mt-10 flex flex-wrap justify-center gap-3"
        action={localePath(locale, "/films")}
        aria-label={t.filtersLabel}
        onSubmit={(e) => e.preventDefault()}
      >
        <NativeSelect
          name="decade"
          aria-label={t.decade}
          value={selection.decade ?? ""}
          onChange={(e) =>
            update({ ...selection, decade: e.target.value ? Number(e.target.value) : undefined })
          }
        >
          <option value="">{t.allDecades}</option>
          {decades.map((d) => (
            <option key={d} value={d}>
              {t.decadeLabel(d)}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          name="country"
          aria-label={t.country}
          value={selection.country ?? ""}
          onChange={(e) => update({ ...selection, country: e.target.value || undefined })}
        >
          <option value="">{t.allCountries}</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </NativeSelect>
        <NativeSelect
          name="palette"
          aria-label={t.palette}
          value={selection.palette ?? ""}
          onChange={(e) =>
            update({
              ...selection,
              palette:
                e.target.value === "bw" || e.target.value === "color" ? e.target.value : undefined,
            })
          }
        >
          <option value="">{t.allPalettes}</option>
          <option value="bw">{t.paletteBw}</option>
          <option value="color">{t.paletteColor}</option>
        </NativeSelect>
        {tags.length > 0 && (
          <NativeSelect
            name="tag"
            aria-label={t.tag}
            value={selection.tag ?? ""}
            onChange={(e) => update({ ...selection, tag: e.target.value || undefined })}
          >
            <option value="">{t.allTags}</option>
            {tags.map((tag) => (
              <option key={tag.slug} value={tag.slug}>
                {tag.label}
              </option>
            ))}
          </NativeSelect>
        )}
        {/* Filters apply on change; only a reader without JS needs this. */}
        <noscript>
          <button type="submit" className="h-9 border border-ink px-4 text-sm tracking-label">
            {t.filter}
          </button>
        </noscript>
      </form>

      <p
        className="mt-6 text-center text-ink-muted text-sm tracking-label"
        aria-live="polite"
        aria-atomic
      >
        {filtered ? t.filtered(shown.length, films.length) : t.count(films.length)}
        {filtered && (
          <>
            <span className="mx-2">·</span>
            <button type="button" className="text-brand hover:underline" onClick={() => update({})}>
              {t.clear}
            </button>
          </>
        )}
      </p>

      {shown.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2">
          {shown.map((film) => (
            <FilmCard
              key={film.id}
              href={film.href}
              title={film.title}
              subtitle={film.subtitle}
              year={film.year}
              directorsLabel={film.directorsLabel}
              imageUrl={film.imageUrl}
              imageAlt={film.imageAlt}
              imageColor={film.imageColor}
            />
          ))}
        </div>
      ) : (
        <EmptyState title={t.empty}>
          <p>{t.emptyHint}</p>
          <button type="button" className={`${HOUSE_BUTTON} mt-6`} onClick={() => update({})}>
            {t.clear}
          </button>
        </EmptyState>
      )}
    </>
  );
}
