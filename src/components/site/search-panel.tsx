"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type RefObject, useMemo, useState } from "react";
import { SearchResults } from "@/components/site/search-results";
import { useSearchIndex } from "@/components/site/use-search-index";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import { matchDocs } from "@/lib/search-match";

/**
 * The header search overlay itself — Radix Dialog, the input, the
 * matcher and the results — loaded by SearchDialog on first intent so
 * none of it ships with the layout. The index loads on first open and
 * is cached per session (shared with /search).
 */
export function SearchPanel({
  locale,
  labels,
  open,
  onClose,
  triggerRef,
}: {
  locale: Locale;
  labels: Dictionary["search"];
  open: boolean;
  onClose: () => void;
  /** Focus returns here on close (the trigger lives outside the Dialog). */
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const { docs, status, retry } = useSearchIndex(locale, open);
  const results = useMemo(() => matchDocs(docs, query), [docs, query]);

  // Every close path clears the query.
  const close = () => {
    onClose();
    setQuery("");
  };

  const allResultsHref = localePath(
    locale,
    query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search",
  );

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? undefined : close())}>
      <DialogContent
        closeLabel={labels.close}
        className="top-24 translate-y-0 gap-0 p-4 sm:max-w-lg"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      >
        <DialogTitle className="sr-only">{labels.title}</DialogTitle>
        {/* Clear of the close button in the top-right corner. */}
        <div className="pr-10">
          <Input
            type="search"
            placeholder={labels.placeholder}
            aria-label={labels.title}
            value={query}
            onChange={(e) => {
              // Typing after a transient index failure retries the fetch.
              if (status === "failed") retry();
              setQuery(e.target.value);
            }}
            onKeyDown={(e) => {
              // Enter goes to the top-ranked result; with nothing matched
              // yet it falls through to the full page.
              if (e.key !== "Enter") return;
              e.preventDefault();
              close();
              router.push(results[0]?.href ?? allResultsHref);
            }}
          />
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          <SearchResults
            labels={labels}
            query={query}
            results={results}
            status={status}
            onNavigate={close}
          />
        </div>
        <p className="mt-4 border-line border-t pt-3 text-center">
          <Link
            href={allResultsHref}
            onClick={close}
            className="text-brand text-sm hover:underline"
          >
            {labels.allResults}
          </Link>
        </p>
      </DialogContent>
    </Dialog>
  );
}
