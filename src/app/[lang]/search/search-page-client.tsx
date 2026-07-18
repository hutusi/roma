"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SearchResults } from "@/components/site/search-results";
import { useSearchIndex } from "@/components/site/use-search-index";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import type { Locale } from "@/i18n/locales";
import { matchDocs } from "@/lib/search-match";

/**
 * The stateful search UI without useSearchParams, so it can double as
 * the Suspense fallback (the films-view arrangement): the fallback
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
      if (query.trim()) url.searchParams.set("q", query);
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
