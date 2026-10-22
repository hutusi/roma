/**
 * Generates the self-hosted CJK serif (ADR 0018):
 *
 *   public/fonts/babuban-serif-sc/*.woff2   frequency-bucketed subsets
 *   src/assets/fonts/babuban-serif-sc.css   one @font-face per bucket
 *   src/assets/fonts/preload.ts             bucket(s) worth preloading
 *
 * The source is the full static Noto Serif SC that @fontsource already
 * ships (its `chinese-simplified` file carries the whole cmap) — never
 * fetched (ADR 0002), version pinned by bun.lock, glyph-identical to the
 * Fontsource slices that stay behind as the fallback for characters the
 * corpus doesn't contain yet.
 *
 * Code points come from the page model in src/lib/font-corpus.ts. They
 * are ranked by how many pages use them and cut into contiguous buckets
 * by a small dynamic program that minimises the summed cold-load bytes
 * across all pages (each file a page touches costs its size plus a
 * per-request penalty). Common characters thus share a small file every
 * page loads; rare ones sit in files only their pages pay for.
 *
 * Incremental: the buckets in the committed CSS are kept byte for byte
 * (files are named by content hash, so their URLs and cache entries
 * survive) and only glyphs they lack are cut into new buckets. Run with
 * --repartition to re-optimise from scratch when the summary reports
 * drift. Deterministic either way: rerunning without corpus changes
 * produces identical bytes.
 *
 * Run: bun run fonts:generate [--repartition]   (whenever seed-data or
 * public UI copy changes — the coverage test fails until you do)
 */
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import fontverter from "fontverter";
import opentype from "opentype.js";
import subsetFont from "subset-font";
import { type FontPage, fontPages, glyphCodePoints } from "@/lib/font-corpus";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const FAMILY = "Babuban Serif SC";
const PUBLIC_DIR = "public/fonts/babuban-serif-sc";
const URL_BASE = "/fonts/babuban-serif-sc";
const CSS_OUT = "src/assets/fonts/babuban-serif-sc.css";
const PRELOAD_OUT = "src/assets/fonts/preload.ts";
const SOURCES = {
  400: "node_modules/@fontsource/noto-serif-sc/files/noto-serif-sc-chinese-simplified-400-normal.woff2",
  700: "node_modules/@fontsource/noto-serif-sc/files/noto-serif-sc-chinese-simplified-700-normal.woff2",
} as const;
type Weight = keyof typeof SOURCES;

/** Rough woff2 cost model for the optimiser (measured: ~195 B/CJK glyph). */
const BYTES_PER_GLYPH = 195;
/** Per-file cost: woff2 tables + a request. Keeps the optimiser off confetti. */
const FILE_PENALTY = 5_000;
/** Boundaries are searched on this grid (glyphs); finer adds nothing. */
const STEP = 10;

async function cmapOf(buf: Buffer): Promise<Set<number>> {
  const sfnt: Buffer = await fontverter.convert(buf, "truetype");
  const font = opentype.parse(
    sfnt.buffer.slice(sfnt.byteOffset, sfnt.byteOffset + sfnt.byteLength),
    { lowMemory: true },
  );
  const map = (font.tables.cmap as unknown as { glyphIndexMap: Record<string, number> })
    .glyphIndexMap;
  return new Set(Object.keys(map).map(Number));
}

/**
 * Optimal contiguous partition of `ranked` (most-shared first). cost of a
 * bucket [i, j) = (#pages touching it) × (estimated bytes + penalty).
 */
function partition(ranked: number[], pageSets: Set<number>[]): number[][] {
  const rank = new Map(ranked.map((cp, i) => [cp, i]));
  const n = ranked.length;
  // Each page's ranks, sorted, for "first rank ≥ i" lookups.
  const pageRanks = pageSets.map((s) =>
    [...s]
      .map((cp) => rank.get(cp))
      .filter((r): r is number => r !== undefined)
      .sort((a, b) => a - b),
  );
  const cuts: number[] = [];
  for (let i = 0; i < n; i += STEP) cuts.push(i);
  cuts.push(n);
  const best = new Array<number>(cuts.length).fill(Number.POSITIVE_INFINITY);
  const from = new Array<number>(cuts.length).fill(-1);
  best[0] = 0;
  for (let a = 0; a < cuts.length - 1; a++) {
    const i = cuts[a];
    // For each page, the first rank at or after i (or ∞).
    const firsts = pageRanks
      .map((rs) => {
        let lo = 0;
        let hi = rs.length;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (rs[mid] < i) lo = mid + 1;
          else hi = mid;
        }
        return lo < rs.length ? rs[lo] : Number.POSITIVE_INFINITY;
      })
      .sort((x, y) => x - y);
    let touching = 0;
    for (let b = a + 1; b < cuts.length; b++) {
      const j = cuts[b];
      while (touching < firsts.length && firsts[touching] < j) touching++;
      const cost = best[a] + touching * ((j - i) * BYTES_PER_GLYPH + FILE_PENALTY);
      if (cost < best[b]) {
        best[b] = cost;
        from[b] = a;
      }
    }
  }
  const buckets: number[][] = [];
  for (let b = cuts.length - 1; b > 0; b = from[b]) {
    buckets.unshift(ranked.slice(cuts[from[b]], cuts[b]));
  }
  return buckets;
}

/** Sorted code points → compact `U+xx-yy` list. */
function unicodeRange(cps: number[]): string {
  const sorted = [...cps].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    const hex = (n: number) => n.toString(16);
    parts.push(i === j ? `U+${hex(sorted[i])}` : `U+${hex(sorted[i])}-${hex(sorted[j])}`);
    i = j;
  }
  return parts.join(",");
}

type Bucket = {
  weight: Weight;
  index: number;
  cps: number[];
  file: string;
  bytes: number;
  /** Set when the glyphs came from a Fontsource file other than the main source. */
  from?: string;
};

const FONTSOURCE_DIR = "node_modules/@fontsource/noto-serif-sc";

function parseRange(value: string): [number, number][] {
  return value.split(",").map((part) => {
    const [a, b] = part.trim().replace(/^U\+/i, "").split("-");
    return [Number.parseInt(a, 16), Number.parseInt(b ?? a, 16)];
  });
}

/** Fontsource's own faces for a weight (file + unicode-range), from its CSS. */
function fontsourceFaces(weight: Weight): { file: string; ranges: [number, number][] }[] {
  const css = readFileSync(join(root, FONTSOURCE_DIR, `${weight}.css`), "utf8");
  return css
    .split("@font-face")
    .slice(1)
    .map((block) => ({
      file: /url\(\.\/(files\/[^)]+\.woff2)\)/.exec(block)?.[1] ?? "",
      ranges: parseRange(/unicode-range:\s*([^;]+);/.exec(block)?.[1] ?? ""),
    }));
}

async function writeBucket(
  weight: Weight,
  index: number,
  source: Buffer,
  cps: number[],
  from?: string,
): Promise<Bucket> {
  const text = String.fromCodePoint(...[...cps].sort((a, b) => a - b));
  const woff2: Buffer = await subsetFont(source, text, { targetFormat: "woff2" });
  const hash = createHash("sha256").update(woff2).digest("hex").slice(0, 10);
  // Named by content alone, so a bucket that survives a regeneration
  // keeps its URL — and its place in returning readers' caches.
  const file = `${weight}-${hash}.woff2`;
  writeFileSync(join(root, PUBLIC_DIR, file), woff2);
  return { weight, index, cps, file, bytes: woff2.length, from };
}

/** Buckets the committed CSS declares for a weight: the partition to keep. */
function previousBuckets(weight: Weight): { cps: number[]; from?: string }[] {
  let css: string;
  try {
    css = readFileSync(join(root, CSS_OUT), "utf8");
  } catch {
    return [];
  }
  const re =
    /\/\* (\d+) · bucket \d+ · \d+ glyphs · \d+ B(?: · from ([^ ]+))? \*\/\s*@font-face \{([\s\S]*?)\}/g;
  return [...css.matchAll(re)]
    .filter((m) => Number(m[1]) === weight)
    .map((m) => ({
      cps: parseRange(/unicode-range:\s*([^;]+);/.exec(m[3])?.[1] ?? "").flatMap(([a, b]) =>
        Array.from({ length: b - a + 1 }, (_, i) => a + i),
      ),
      from: m[2] ? `files/${m[2]}` : undefined,
    }));
}

async function buildWeight(
  weight: Weight,
  pages: FontPage[],
  repartition: boolean,
): Promise<Bucket[]> {
  const source = readFileSync(join(root, SOURCES[weight]));
  const cmap = await cmapOf(source);
  const pageSets = pages.map(
    (p) =>
      new Set(
        [...glyphCodePoints(weight === 400 ? p.regular : p.bold)].filter((cp) => cmap.has(cp)),
      ),
  );
  const freq = new Map<number, number>();
  for (const s of pageSets) for (const cp of s) freq.set(cp, (freq.get(cp) ?? 0) + 1);
  const ranked = [...freq.keys()].sort((a, b) => (freq.get(b) ?? 0) - (freq.get(a) ?? 0) || a - b);

  // Incremental by default: the committed buckets stay exactly as they
  // are (same bytes, same URLs) and only glyphs they lack are partitioned
  // into new buckets. A UI string no longer re-cuts — and re-downloads —
  // the whole set. --repartition starts from scratch.
  const previous = repartition ? [] : previousBuckets(weight);
  const kept = previous.filter((b) => !b.from);
  const covered = new Set(kept.flatMap((b) => b.cps));
  const fresh = ranked.filter((cp) => !covered.has(cp));
  stats[weight] = {
    stale: [...covered].filter((cp) => !freq.has(cp)).length,
    fresh: fresh.length,
    total: ranked.length,
  };

  const buckets: Bucket[] = [];
  for (const cps of [
    ...kept.map((b) => b.cps),
    ...(fresh.length ? partition(fresh, pageSets) : []),
  ]) {
    buckets.push(await writeBucket(weight, buckets.length, source, cps));
  }

  // Glyphs the main source lacks — Cyrillic and macron Latin in original
  // titles, a few traditional forms, arrows — live in other Fontsource
  // files cut from the same Noto Serif SC. Each such file is subset to
  // what the corpus needs from it; glyphs no Noto Serif SC file has
  // (e.g. Bengali) keep falling back to the system, as before.
  const needed = new Set(
    pages.flatMap((p) => [...glyphCodePoints(weight === 400 ? p.regular : p.bold)]),
  );
  const faces = fontsourceFaces(weight);
  const keptExtras = previous.filter((b) => b.from);
  for (const b of keptExtras) {
    const extra = readFileSync(join(root, FONTSOURCE_DIR, b.from as string));
    buckets.push(await writeBucket(weight, buckets.length, extra, b.cps, b.from));
  }
  const extraCovered = new Set(keptExtras.flatMap((b) => b.cps));
  const byFile = new Map<string, number[]>();
  for (const cp of [...needed]
    .filter((c) => !cmap.has(c) && !extraCovered.has(c))
    .sort((a, b) => a - b)) {
    const face = faces.find((f) => f.ranges.some(([a, b]) => cp >= a && cp <= b));
    if (face) byFile.set(face.file, [...(byFile.get(face.file) ?? []), cp]);
  }
  for (const [file, cps] of [...byFile].sort(([a], [b]) => a.localeCompare(b))) {
    const extra = readFileSync(join(root, FONTSOURCE_DIR, file));
    const have = await cmapOf(extra);
    const present = cps.filter((cp) => have.has(cp));
    if (present.length)
      buckets.push(await writeBucket(weight, buckets.length, extra, present, file));
  }
  return buckets;
}

const repartition = process.argv.includes("--repartition");
const stats: Partial<Record<Weight, { stale: number; fresh: number; total: number }>> = {};
const pages = fontPages(root);
rmSync(join(root, PUBLIC_DIR), { recursive: true, force: true });
mkdirSync(join(root, PUBLIC_DIR), { recursive: true });
mkdirSync(join(root, "src/assets/fonts"), { recursive: true });

const all = [
  ...(await buildWeight(400, pages, repartition)),
  ...(await buildWeight(700, pages, repartition)),
];

const faces = all.map(
  (
    b,
  ) => `/* ${b.weight} · bucket ${b.index} · ${b.cps.length} glyphs · ${b.bytes} B${b.from ? ` · from ${b.from.replace(/^files\//, "")}` : ""} */
@font-face {
  font-family: "${FAMILY}";
  font-style: normal;
  font-display: swap;
  font-weight: ${b.weight};
  src: url("${URL_BASE}/${b.file}") format("woff2");
  unicode-range: ${unicodeRange(b.cps)};
}`,
);
writeFileSync(
  join(root, CSS_OUT),
  `/* Generated by scripts/generate-fonts.ts — do not edit. ADR 0018. */\n\n${faces.join("\n\n")}\n`,
);

// Buckets nearly every zh page touches (chrome, UI copy, the commonest
// hanzi) are worth fetching before CSS discovery; everything else loads
// on demand via unicode-range. /en needs too little CJK to preload.
const zhPages = pages.filter((p) => p.id.startsWith("zh/"));
const touchRate = (b: Bucket) =>
  zhPages.filter((p) => {
    const need = glyphCodePoints(b.weight === 400 ? p.regular : p.bold);
    return b.cps.some((cp) => need.has(cp));
  }).length / zhPages.length;
/** Preloads compete with the LCP image; keep them to the commonest bytes. */
const PRELOAD_BUDGET = 64 * 1024;
const preloads: string[] = [];
let spent = 0;
for (const { b } of all
  .map((b) => ({ b, rate: touchRate(b) }))
  .filter(({ rate }) => rate >= 0.9)
  .sort((x, y) => y.rate - x.rate || x.b.bytes - y.b.bytes)) {
  if (spent + b.bytes > PRELOAD_BUDGET) continue;
  spent += b.bytes;
  preloads.push(`${URL_BASE}/${b.file}`);
}
preloads.sort();
writeFileSync(
  join(root, PRELOAD_OUT),
  `// Generated by scripts/generate-fonts.ts — do not edit. ADR 0018.\n\n/** The commonest zh buckets (≥90% of pages, 64 KB budget); zh pages only. */\nexport const ZH_FONT_PRELOADS = ${JSON.stringify(preloads, null, 2)} as const;\n`,
);

for (const w of [400, 700] as const) {
  const bs = all.filter((b) => b.weight === w);
  console.log(
    `${w}: ${bs.length} buckets, ${bs.reduce((n, b) => n + b.cps.length, 0)} glyphs, ` +
      `${Math.round(bs.reduce((n, b) => n + b.bytes, 0) / 1024)} KB — ` +
      bs.map((b) => `${b.cps.length}g/${Math.round(b.bytes / 1024)}KB`).join(", "),
  );
}

// Incremental runs drift from the optimum as glyphs come and go; say
// when a full re-cut is worth the one-time cache miss.
for (const w of [400, 700] as const) {
  const st = stats[w];
  if (!st || repartition) continue;
  const drift = (st.stale + st.fresh) / Math.max(1, st.total);
  console.log(
    `${w}: kept the committed buckets; ${st.fresh} new glyphs, ${st.stale} no longer used` +
      (drift > 0.15 ? " — over 15% drift, consider --repartition" : ""),
  );
}

// Modelled cold cost per page — what the optimiser bought. The real
// numbers come from `bun run fonts:report` against a production build.
const costs = pages.map((p) => {
  const touched = all.filter((b) => {
    const need = glyphCodePoints(b.weight === 400 ? p.regular : p.bold);
    return b.cps.some((cp) => need.has(cp));
  });
  return { id: p.id, files: touched.length, kb: touched.reduce((n, b) => n + b.bytes, 0) / 1024 };
});
for (const edition of ["zh/", "en/"]) {
  const cs = costs.filter((c) => c.id.startsWith(edition)).sort((a, b) => a.kb - b.kb);
  const pick = (q: number) => cs[Math.min(cs.length - 1, Math.floor(q * cs.length))];
  console.log(
    `${edition} model, ${cs.length} pages: median ${Math.round(pick(0.5).kb)} KB ` +
      `(${pick(0.5).files} files), p90 ${Math.round(pick(0.9).kb)} KB, ` +
      `max ${Math.round(cs.at(-1)?.kb ?? 0)} KB (${cs.at(-1)?.id})`,
  );
}
