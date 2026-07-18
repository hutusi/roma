/**
 * Client-side search over the prebuilt per-locale index. Deliberately
 * free of server-only / db imports (the visibility.ts precedent): the
 * server-only builder in search-index.ts imports the types, the dialog
 * and /search islands import the matcher, and the unit tests exercise
 * the whole engine with plain objects.
 *
 * Matching is normalized substring containment — CJK needs no
 * tokenization, and predictable beats fuzzy for a curated corpus of
 * this size (ADR 0002 rules out hosted search; ADR 0005 favors a
 * static index over a live query path).
 */

export type SearchDocType = "film" | "person" | "list" | "tag";

export type SearchDoc = {
  type: SearchDocType;
  /** Locale-prefixed href, prebuilt server-side via localePath()/personPath(). */
  href: string;
  /** Localized display label — already resolved, the only prominent text shown. */
  label: string;
  /** Localized secondary line; display only, never matched. */
  sublabel: string | null;
  /**
   * Every matchable name variant, deduped, label included. Names are
   * names, not prose — BOTH editions carry all variants, which is what
   * makes 北非谍影 / 卡萨布兰卡 / Casablanca find the same film.
   */
  names: string[];
  /** The locale's own prose (编辑札记 / bio) — matched, never displayed. */
  prose?: string;
  /** Films only; matched by exact string equality against the query. */
  year?: number;
};

export type SearchIndex = { docs: SearchDoc[] };

/**
 * NFKC folds the full-width Latin/digits CJK IMEs produce
 * (Ｃａｓａｂｌａｎｃａ → casablanca); the NFD pass then strips
 * combining marks so accentless input finds accented names — a zh
 * reader types "anouk aimee", the corpus says "Anouk Aimée" (CJK
 * carries no combining marks, so it passes through untouched).
 * Applied to both doc strings and the query, so quirks like
 * 8½ → "81⁄2" stay self-consistent.
 */
export function normalizeForSearch(s: string): string {
  return s.normalize("NFKC").normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
}

/**
 * One Latin letter matches half the corpus; one CJK character is a
 * word. So: any non-ASCII character makes a 1-char query meaningful,
 * pure-ASCII needs at least 2.
 */
export function isQueryLongEnough(rawQuery: string): boolean {
  const q = normalizeForSearch(rawQuery);
  if (q.length === 0) return false;
  // biome-ignore lint/suspicious/noControlCharactersInRegex: ASCII range test
  return q.length >= 2 || /[^\x00-\x7f]/.test(q);
}

const TYPE_WEIGHT: Record<SearchDocType, number> = { film: 4, person: 3, list: 2, tag: 1 };

function scoreDoc(doc: SearchDoc, q: string): number {
  let best = 0;
  for (const name of doc.names) {
    const n = normalizeForSearch(name);
    if (n === q) return 4;
    if (n.startsWith(q)) best = Math.max(best, 3);
    else if (n.includes(q)) best = Math.max(best, 2);
  }
  // Exact year only — "196" tier-matching every 1960s film would drown
  // the name tiers in noise. q is normalized, so full-width digits fold.
  if (best < 2 && doc.year !== undefined && q === String(doc.year)) best = 2;
  if (best < 1 && doc.prose && normalizeForSearch(doc.prose).includes(q)) best = 1;
  return best;
}

export function matchDocs(docs: SearchDoc[], rawQuery: string, limit = 20): SearchDoc[] {
  if (!isQueryLongEnough(rawQuery)) return [];
  const q = normalizeForSearch(rawQuery);
  return docs
    .map((doc, index) => ({ doc, index, tier: scoreDoc(doc, q) }))
    .filter((s) => s.tier > 0)
    .sort(
      (a, b) =>
        b.tier - a.tier || TYPE_WEIGHT[b.doc.type] - TYPE_WEIGHT[a.doc.type] || a.index - b.index,
    )
    .slice(0, limit)
    .map((s) => s.doc);
}

const GROUP_ORDER: SearchDocType[] = ["film", "person", "list", "tag"];

/** Fixed group order, rank order preserved within groups, empty groups dropped. */
export function groupResults(results: SearchDoc[]): { type: SearchDocType; docs: SearchDoc[] }[] {
  return GROUP_ORDER.map((type) => ({ type, docs: results.filter((d) => d.type === type) })).filter(
    (g) => g.docs.length > 0,
  );
}
