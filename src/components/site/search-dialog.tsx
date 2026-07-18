"use client";

import { SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SearchResults } from "@/components/site/search-results";
import { useSearchIndex } from "@/components/site/use-search-index";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";
import { matchDocs } from "@/lib/search-match";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.isContentEditable
  );
}

/**
 * Header search overlay — the AuthMenu convention: a client island fed
 * translated labels as props from the server header. The index loads
 * on first open and is cached per session (shared with /search).
 */
export function SearchDialog({ locale, labels }: { locale: Locale; labels: Dictionary["search"] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { docs, status } = useSearchIndex(locale, open);
  const results = useMemo(() => matchDocs(docs, query), [docs, query]);

  // ⌘K / Ctrl+K anywhere; "/" when not typing. The admin tree has its
  // own root layout without this header, so no conflict with its forms.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const cmdK = event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);
      const slash = event.key === "/" && !isTypingTarget(event.target);
      if (cmdK || slash) {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const allResultsHref = localePath(
    locale,
    query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search",
  );

  const close = () => setOpen(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="self-center text-ink transition-colors hover:text-brand"
          aria-label={labels.open}
        >
          <SearchIcon className="h-4 w-4" aria-hidden />
        </button>
      </DialogTrigger>
      <DialogContent className="top-24 translate-y-0 gap-0 p-4 sm:max-w-lg">
        <DialogTitle className="sr-only">{labels.title}</DialogTitle>
        <Input
          type="search"
          placeholder={labels.placeholder}
          aria-label={labels.title}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter goes to the top-ranked result; with nothing matched
            // yet it falls through to the full page.
            if (e.key !== "Enter") return;
            e.preventDefault();
            close();
            router.push(results[0]?.href ?? allResultsHref);
          }}
        />
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
