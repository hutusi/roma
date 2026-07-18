import Link from "next/link";
import type { SearchIndexStatus } from "@/components/site/use-search-index";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { groupResults, isQueryLongEnough, type SearchDoc } from "@/lib/search-match";

/**
 * Presentational only (no hooks) so the header dialog and the /search
 * page render results identically. Shows labels and sublabels, never
 * prose — matched prose stays invisible, which is also what keeps zh
 * prose off /en surfaces.
 */
export function SearchResults({
  labels,
  query,
  results,
  status,
  onNavigate,
}: {
  labels: Dictionary["search"];
  query: string;
  results: SearchDoc[];
  status: SearchIndexStatus;
  onNavigate?: () => void;
}) {
  if (!isQueryLongEnough(query)) return null;
  if (status === "idle" || status === "loading") {
    return <p className="mt-6 text-center text-ink-muted text-sm">{labels.loading}</p>;
  }
  if (status === "failed") {
    return <p className="mt-6 text-center text-ink-muted text-sm">{labels.failed}</p>;
  }
  if (results.length === 0) {
    return <p className="mt-6 text-center text-ink-muted text-sm">{labels.empty}</p>;
  }

  return (
    <div className="mt-4 space-y-5">
      {groupResults(results).map((group) => (
        <section key={group.type}>
          <h3 className="text-ink-muted text-xs tracking-[0.2em]">{labels.groups[group.type]}</h3>
          <ul className="mt-2 space-y-1">
            {group.docs.map((doc) => (
              <li key={doc.href}>
                <Link
                  href={doc.href}
                  onClick={onNavigate}
                  className="block border border-transparent px-2 py-1.5 transition-colors hover:border-line hover:bg-card"
                >
                  <span>{doc.label}</span>
                  {doc.sublabel && (
                    <span className="ml-2 text-ink-muted text-sm">{doc.sublabel}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
