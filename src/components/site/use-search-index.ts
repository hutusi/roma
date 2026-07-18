"use client";

import { useEffect, useState } from "react";
import { type Locale, localePath } from "@/i18n/locales";
import type { SearchDoc, SearchIndex } from "@/lib/search-match";

export type SearchIndexStatus = "idle" | "loading" | "ready" | "failed";

// Module-level cache: one fetch per locale per session, shared by the
// header dialog and the /search page island.
const cache = new Map<Locale, Promise<SearchIndex>>();

function fetchIndex(locale: Locale): Promise<SearchIndex> {
  let promise = cache.get(locale);
  if (!promise) {
    promise = fetch(localePath(locale, "/search-index.json")).then((res) => {
      if (!res.ok) throw new Error(`search index ${res.status}`);
      return res.json() as Promise<SearchIndex>;
    });
    // Drop a failed fetch so the next enable retries.
    promise.catch(() => cache.delete(locale));
    cache.set(locale, promise);
  }
  return promise;
}

/**
 * Lazily loads the locale's search index the first time `enabled` is
 * true (dialog opened / page mounted). A failure does NOT auto-retry
 * in a loop; it retries on the next enable transition or an explicit
 * retry() call (both refetch, since the cache entry was dropped).
 */
export function useSearchIndex(locale: Locale, enabled: boolean) {
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [status, setStatus] = useState<SearchIndexStatus>("idle");
  const [attempt, setAttempt] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` is a deliberate re-trigger — retry() bumps it to refetch after a failure.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setStatus((s) => (s === "ready" ? s : "loading"));
    fetchIndex(locale).then(
      (index) => {
        if (cancelled) return;
        setDocs(index.docs);
        setStatus("ready");
      },
      () => {
        if (!cancelled) setStatus("failed");
      },
    );
    return () => {
      cancelled = true;
    };
  }, [locale, enabled, attempt]);

  return { docs, status, retry: () => setAttempt((a) => a + 1) };
}
