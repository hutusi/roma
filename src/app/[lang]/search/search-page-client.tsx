"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SearchResults } from "@/components/site/search-results";
import { useSearchIndex } from "@/components/site/use-search-index";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import { isQueryLongEnough, matchDocs } from "@/lib/search-match";

/**
 * The stateful search UI without useSearchParams, so it can double as
 * the Suspense fallback (a page-and-island arrangement): the fallback
 * prerenders the empty-query shell into static HTML, and the island
 * below swaps in with the ?q-seeded state on hydration.
 */
export function SearchPageBody({
  locale,
  labels,
  initialQuery,
}: {
  locale: Locale;
  labels: Dictionary["search"];
  initialQuery: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const { docs, status, retry } = useSearchIndex(locale, true);
  const results = useMemo(() => matchDocs(docs, query), [docs, query]);

  // Same-route navigations (View-all-results from the dialog while on
  // /search, back/forward between ?q states) change the prop without
  // remounting — adopt the URL's query. The guard makes our own
  // debounced replaceState round-trip (which always writes the
  // then-current query) a no-op instead of clobbering typing.
  const [lastInitial, setLastInitial] = useState(initialQuery);
  if (initialQuery !== lastInitial) {
    setLastInitial(initialQuery);
    if (initialQuery !== query) setQuery(initialQuery);
  }

  // Keep ?q shareable without re-rendering the server tree per
  // keystroke: native history.replaceState (App Router keeps
  // useSearchParams in sync with it), debounced.
  useEffect(() => {
    const id = setTimeout(() => {
      const url = new URL(window.location.href);
      const next = query.trim() ? query : "";
      // Only write when the query actually changed. An unconditional
      // write on mount raced same-route navigations: fired while the
      // dialog's "view all results" push was in flight, it put the old
      // ?q back and the router followed it.
      if ((url.searchParams.get("q") ?? "") === next) return;
      if (next) url.searchParams.set("q", next);
      else url.searchParams.delete("q");
      window.history.replaceState(null, "", url);
    }, 300);
    return () => clearTimeout(id);
  }, [query]);

  return (
    <div className="mx-auto mt-10 max-w-xl">
      <Input
        type="search"
        placeholder={labels.placeholder}
        aria-label={labels.title}
        value={query}
        onChange={(e) => {
          // A transient index failure retries as soon as the reader
          // keeps typing — no reload needed.
          if (status === "failed") retry();
          setQuery(e.target.value);
        }}
        autoFocus
      />
      <SearchResults labels={labels} query={query} results={results} status={status} />
      {/* Nothing typed, or nothing found: say what can be searched and
          offer the catalogue instead of a blank page. */}
      {(!isQueryLongEnough(query) || (status === "ready" && results.length === 0)) && (
        <div className="mt-8 text-center text-ink-muted text-sm">
          {!isQueryLongEnough(query) && <p>{labels.emptyQuery}</p>}
          <p className="mt-3">
            <Link href={localePath(locale, "/films")} className="text-brand hover:underline">
              {labels.browseFilms}
            </Link>
            <span className="mx-2">·</span>
            <Link href={localePath(locale, "/lists")} className="text-brand hover:underline">
              {labels.browseLists}
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}

/** Reads ?q inside the page's Suspense boundary and seeds the body. */
export function SearchPageWithParams({
  locale,
  labels,
}: {
  locale: Locale;
  labels: Dictionary["search"];
}) {
  const params = useSearchParams();
  return <SearchPageBody locale={locale} labels={labels} initialQuery={params.get("q") ?? ""} />;
}
