/**
 * Resolve external ids for the seed corpus — a dev-time helper, not part
 * of any deploy. For each seed film it walks TMDB (explicit tmdbId or
 * title+year search, same strategy as the image seeder) to the IMDb id,
 * then one batched Wikidata SPARQL query maps IMDb ids to QIDs plus the
 * Douban film id (P4529). Nothing is written to the DB or to seed-data —
 * it prints a JSON object keyed by slug for review and merging into
 * `seed-data/films.ts`, with warnings (year drift, TMDB-id mismatch
 * against Wikidata's P4947, missing links) on stderr so redirected
 * stdout stays parseable.
 *
 *   TMDB_API_TOKEN=… bun run src/db/enrich-external-ids.ts > ids.json
 *
 * Wikidata's "silent film" genre claim is reported as `silentHint` —
 * a review aid only; isSilent stays hand-curated.
 */
import { seedFilms } from "./seed-data/films";

const TMDB_API = "https://api.themoviedb.org/3";
const WDQS = "https://query.wikidata.org/sparql";
const UA = "babuban-seed-enrich/1.0 (https://babuban.com)";

type Enriched = {
  tmdbId?: number;
  imdbId?: string;
  doubanId?: string;
  wikidataId?: string;
  /** Wikidata says genre includes silent film (Q226730) — verify by hand. */
  silentHint?: true;
};

const warn = (msg: string) => console.error(msg);

async function tmdbGet(path: string, token: string): Promise<Record<string, unknown>> {
  const res = await fetch(`${TMDB_API}${path}`, {
    headers: { Authorization: `Bearer ${token}`, "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${path}`);
  return res.json() as Promise<Record<string, unknown>>;
}

async function resolveTmdbId(
  f: (typeof seedFilms)[number],
  token: string,
): Promise<number | undefined> {
  if (f.tmdbId) return f.tmdbId;
  const q = encodeURIComponent(f.titleOriginal || f.titleEn || f.titleZh);
  let results = (await tmdbGet(`/search/movie?query=${q}&year=${f.year}`, token)).results as
    | Record<string, unknown>[]
    | undefined;
  if (!results?.length) {
    const q2 = encodeURIComponent(f.titleEn || f.titleOriginal);
    results = (await tmdbGet(`/search/movie?query=${q2}`, token)).results as
      | Record<string, unknown>[]
      | undefined;
  }
  const hit = results?.[0];
  if (!hit || typeof hit.id !== "number") return undefined;
  // Search matches are guesses — surface what was matched so a wrong
  // first result can't slip into seed-data unnoticed.
  const hitYear = typeof hit.release_date === "string" ? hit.release_date.slice(0, 4) : "?";
  warn(
    `  search ${f.slug}: matched tmdb ${hit.id} "${hit.original_title}" (${hitYear})${
      Math.abs(Number(hitYear) - f.year) > 1 ? " ⚠ YEAR DRIFT" : ""
    }`,
  );
  return hit.id;
}

type WikidataRow = { imdb: string; qid: string; douban?: string; tmdb?: string; silent: boolean };

async function wikidataByImdb(imdbIds: string[]): Promise<Map<string, WikidataRow[]>> {
  if (!imdbIds.length) return new Map();
  const values = imdbIds.map((id) => `"${id}"`).join(" ");
  const query = `
    SELECT ?imdb ?item ?douban ?tmdb ?silent WHERE {
      VALUES ?imdb { ${values} }
      ?item wdt:P345 ?imdb .
      OPTIONAL { ?item wdt:P4529 ?douban }
      OPTIONAL { ?item wdt:P4947 ?tmdb }
      BIND(EXISTS { ?item wdt:P136 wd:Q226730 } AS ?silent)
    }`;
  const res = await fetch(`${WDQS}?query=${encodeURIComponent(query)}&format=json`, {
    headers: { "User-Agent": UA, Accept: "application/sparql-results+json" },
  });
  if (!res.ok) throw new Error(`Wikidata ${res.status}`);
  const json = (await res.json()) as {
    results: { bindings: Record<string, { value: string } | undefined>[] };
  };
  const bySlugless = new Map<string, WikidataRow[]>();
  for (const b of json.results.bindings) {
    const imdb = b.imdb?.value;
    const item = b.item?.value;
    if (!imdb || !item) continue;
    const row: WikidataRow = {
      imdb,
      qid: item.replace(/^.*\//, ""),
      douban: b.douban?.value,
      tmdb: b.tmdb?.value,
      silent: b.silent?.value === "true",
    };
    const rows = bySlugless.get(imdb) ?? [];
    rows.push(row);
    bySlugless.set(imdb, rows);
  }
  return bySlugless;
}

async function main() {
  const token = process.env.TMDB_API_TOKEN;
  if (!token) {
    console.error("TMDB_API_TOKEN is not set.");
    process.exit(1);
  }

  const out: Record<string, Enriched> = {};
  const imdbToSlug = new Map<string, string>();

  warn(`Resolving ${seedFilms.length} films via TMDB…`);
  for (const f of seedFilms) {
    const enriched: Enriched = {};
    out[f.slug] = enriched;
    // Seed values win — this script only fills what curation hasn't.
    if (f.imdbId) enriched.imdbId = f.imdbId;
    try {
      const tmdbId = await resolveTmdbId(f, token);
      if (!tmdbId) {
        warn(`  ✗ ${f.slug}: no TMDB match`);
        continue;
      }
      enriched.tmdbId = tmdbId;
      if (!enriched.imdbId) {
        const ext = await tmdbGet(`/movie/${tmdbId}/external_ids`, token);
        if (typeof ext.imdb_id === "string" && ext.imdb_id) enriched.imdbId = ext.imdb_id;
        else warn(`  ✗ ${f.slug}: TMDB has no IMDb id`);
      }
      if (enriched.imdbId) imdbToSlug.set(enriched.imdbId, f.slug);
    } catch (error) {
      warn(`  ✗ ${f.slug}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  warn(`Querying Wikidata for ${imdbToSlug.size} IMDb ids…`);
  const wd = await wikidataByImdb([...imdbToSlug.keys()]);
  for (const [imdb, slug] of imdbToSlug) {
    const rows = wd.get(imdb);
    const enriched = out[slug];
    if (!rows?.length) {
      warn(`  ✗ ${slug}: no Wikidata item for ${imdb}`);
      continue;
    }
    if (rows.length > 1 && new Set(rows.map((r) => r.qid)).size > 1) {
      warn(`  ⚠ ${slug}: ${imdb} matches multiple Wikidata items — taking ${rows[0].qid}`);
    }
    const row = rows[0];
    enriched.wikidataId = row.qid;
    if (row.douban) enriched.doubanId = row.douban;
    else warn(`  – ${slug}: Wikidata has no Douban id (fill by hand)`);
    if (row.silent) enriched.silentHint = true;
    if (row.tmdb && enriched.tmdbId && row.tmdb !== String(enriched.tmdbId)) {
      warn(`  ⚠ ${slug}: TMDB id ${enriched.tmdbId} ≠ Wikidata's P4947 ${row.tmdb} — verify`);
    }
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
