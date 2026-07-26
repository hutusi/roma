/**
 * Pull the structured facts a film introduction is expected to state, from
 * Wikidata, via the `wikidataId` already stored on every film (ADR 0016).
 *
 * This exists because the register change made facts load-bearing. Voiced
 * prose could be overwrought but not wrong; 《日落大道》获最佳原创剧本 can
 * simply be false, and three of the first six rewritten introductions were
 * (8½ won two Oscars rather than one, its title arithmetic is contested,
 * and Sunset Boulevard's category is Best Story and Screenplay).
 *
 * It is NOT a grader. Checking free prose against a knowledge graph is not
 * a problem regexes solve, and a tool that pretended to would be worse than
 * none — a green tick on an unverified claim is how the errors got in. So
 * it does two separable things:
 *
 *   · CHECKS the two assertions the lint already requires and that are
 *     mechanically decidable: the year, and the director's name.
 *   · PRINTS the facts most likely to be got wrong — awards, production
 *     company, country, runtime — for the writer to work from.
 *
 * Read-only, network-only. It never touches the database.
 *
 *   bun run src/db/verify-facts.ts --films=otto-e-mezzo,tokyo-story
 *   bun run src/db/verify-facts.ts --all
 *   bun run src/db/verify-facts.ts --all --problems   # only films with a mismatch
 */
import { seedActors } from "./seed-data/actors";
import { seedDirectors } from "./seed-data/directors";
import { seedFilms } from "./seed-data/films";

const argv = process.argv.slice(2);
const arg = (n: string) => argv.find((a) => a.startsWith(`--${n}=`))?.slice(n.length + 3);
const PROBLEMS_ONLY = argv.includes("--problems");
const ALL = argv.includes("--all");

const wanted = ALL
  ? seedFilms.map((f) => f.slug)
  : (arg("films")
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? []);

const ENDPOINT = "https://query.wikidata.org/sparql";
/** WDQS requires a descriptive User-Agent and will 403 without one. */
const UA = "babuban-fact-check/1.0 (https://babuban.com; editorial verification)";

type Facts = {
  /** Earliest publication date. A film has one per territory. */
  year?: string;
  directors: string[];
  awards: string[];
  companies: string[];
  countries: string[];
  /** Every recorded runtime — a film has one per cut. */
  durations: string[];
};

/**
 * One query per batch. Labels are bound explicitly with rdfs:label rather
 * than through SERVICE wikibase:label, which does not survive aggregation.
 */
function buildQuery(qids: string[]): string {
  const values = qids.map((q) => `wd:${q}`).join(" ");
  const optional = (prop: string, v: string) =>
    `OPTIONAL { ?film wdt:${prop} ?${v}_ . ?${v}_ rdfs:label ?${v} . FILTER(LANG(?${v})="en") }`;
  // MIN and GROUP_CONCAT rather than SAMPLE, deliberately. A film carries a
  // publication date per territory and a duration per cut, so SAMPLE picked
  // an arbitrary one and reported 花样年华 as 2001 and Lawrence of Arabia as
  // 1963 — both correct in seed-data, both flagged. A checker that cries
  // wolf gets ignored, which defeats the point of having one.
  return `
SELECT ?film (MIN(?yr) AS ?year)
  (GROUP_CONCAT(DISTINCT ?director; separator=" | ") AS ?directors)
  (GROUP_CONCAT(DISTINCT ?award; separator=" | ") AS ?awards)
  (GROUP_CONCAT(DISTINCT ?company; separator=" | ") AS ?companies)
  (GROUP_CONCAT(DISTINCT ?country; separator=" | ") AS ?countries)
  (GROUP_CONCAT(DISTINCT ?dur; separator=" | ") AS ?durations)
WHERE {
  VALUES ?film { ${values} }
  OPTIONAL { ?film wdt:P577 ?date . BIND(STR(YEAR(?date)) AS ?yr) }
  ${optional("P57", "director")}
  ${optional("P166", "award")}
  ${optional("P272", "company")}
  ${optional("P495", "country")}
  OPTIONAL { ?film wdt:P2047 ?dur }
}
GROUP BY ?film`;
}

async function fetchFacts(qids: string[]): Promise<Map<string, Facts>> {
  const out = new Map<string, Facts>();
  if (!qids.length) return out;
  const res = await fetch(`${ENDPOINT}?format=json&query=${encodeURIComponent(buildQuery(qids))}`, {
    headers: { "User-Agent": UA, Accept: "application/sparql-results+json" },
  });
  if (!res.ok) throw new Error(`WDQS ${res.status} ${await res.text().catch(() => "")}`);
  const body = (await res.json()) as {
    results: { bindings: Record<string, { value: string }>[] };
  };
  const split = (s?: string) => (s ? s.split(" | ").filter(Boolean) : []);
  for (const b of body.results.bindings) {
    const qid = b.film.value.split("/").pop() as string;
    out.set(qid, {
      year: b.year?.value,
      directors: split(b.directors?.value),
      awards: split(b.awards?.value),
      companies: split(b.companies?.value),
      countries: split(b.countries?.value),
      durations: split(b.durations?.value),
    });
  }
  return out;
}

const people = [...seedDirectors, ...seedActors];
const OK = "  ok ";
const BAD = "  ⚠  ";

async function main() {
  if (!wanted.length) {
    console.error("Nothing to do. Pass --films=a,b or --all.");
    process.exit(1);
  }
  const targets = seedFilms.filter((f) => wanted.includes(f.slug));
  const unknown = wanted.filter((s) => !seedFilms.some((f) => f.slug === s));
  if (unknown.length) {
    console.error(`Not in seed-data: ${unknown.join(", ")}`);
    process.exit(1);
  }

  const withQid = targets.filter((f) => f.wikidataId);
  const noQid = targets.filter((f) => !f.wikidataId);

  // Batched so one query covers many films; WDQS dislikes long URLs more
  // than it dislikes a few requests.
  const facts = new Map<string, Facts>();
  const BATCH = 25;
  for (let i = 0; i < withQid.length; i += BATCH) {
    const slice = withQid.slice(i, i + BATCH);
    const got = await fetchFacts(slice.map((f) => f.wikidataId as string));
    for (const [k, v] of got) facts.set(k, v);
  }

  let problems = 0;

  for (const f of targets) {
    const wd = f.wikidataId ? facts.get(f.wikidataId) : undefined;
    const intro = f.introduction ?? "";
    const introEn = f.introductionEn ?? "";
    const lines: string[] = [];

    if (!f.wikidataId) {
      lines.push(`${BAD}no wikidataId — nothing to check against`);
    } else if (!wd) {
      lines.push(`${BAD}${f.wikidataId} returned no data`);
    } else {
      // Year: against the EARLIEST recorded release. A later territory
      // release is not a discrepancy, so only an earlier one is reported.
      if (wd.year && Number(wd.year) < f.year) {
        lines.push(`${BAD}year: seed-data ${f.year}, earliest release ${wd.year}`);
      }
      for (const [lang, text] of [
        ["zh", intro],
        ["en", introEn],
      ] as const) {
        if (text && !text.includes(String(f.year))) {
          lines.push(`${BAD}${lang} introduction does not state the year ${f.year}`);
        }
      }

      // Director: the English introduction should use the same spelling as
      // the person entry, which should in turn match Wikidata's label.
      const seedDirNames = f.directorSlugs.map((s) => {
        const p = people.find((x) => x.slug === s);
        return { zh: p?.nameZh ?? p?.name ?? s, en: p?.name ?? s };
      });
      for (const d of seedDirNames) {
        // Case-insensitive: romanizations differ on the capital after a
        // hyphen (Hou Hsiao-hsien / Hou Hsiao-Hsien) and neither is wrong.
        // Diacritics still count, which is what caught Yasujiro vs Yasujirō.
        const eq = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
        if (wd.directors.length && !wd.directors.some((w) => eq(w, d.en))) {
          lines.push(`${BAD}director "${d.en}" not among Wikidata's: ${wd.directors.join(", ")}`);
        }
        if (introEn && !introEn.includes(d.en)) {
          lines.push(`${BAD}en introduction does not name "${d.en}"`);
        }
        if (intro && !intro.includes(d.zh)) {
          lines.push(`${BAD}zh introduction does not name "${d.zh}"`);
        }
      }
    }

    if (lines.length) problems++;
    if (PROBLEMS_ONLY && !lines.length) continue;

    console.log(`\n${f.slug}  ${f.titleZh} (${f.year})  ${f.wikidataId ?? "—"}`);
    for (const l of lines) console.log(l);
    if (wd) {
      // Printed, never asserted: these are what the writer works from, and
      // the class of fact the first six introductions got wrong.
      const show = (label: string, v: string[] | string | undefined) => {
        const s = Array.isArray(v) ? v.join("; ") : v;
        if (s) console.log(`  ${label.padEnd(10)} ${s}`);
      };
      show("awards", wd.awards);
      show("producer", wd.companies);
      show("country", wd.countries);
      show("runtime", wd.durations.length ? `${wd.durations.join(" / ")} min` : undefined);
      // Reported, never counted as a problem. Runtime is the least reliable
      // fact here: PAL speed-up, restorations, and territory cuts all differ
      // legitimately, and Wikidata often records only one of them. Worth a
      // human glance, not worth blocking on.
      const mine = f.runtimeMinutes;
      const cuts = wd.durations.map(Number).filter((n) => !Number.isNaN(n));
      if (mine && cuts.length && !cuts.some((d) => Math.abs(mine - d) <= 3)) {
        console.log(`  note       runtime ${mine} vs Wikidata ${cuts.join(", ")} — check the cut`);
      }
    }
  }

  console.log(
    `\n${targets.length} film(s) checked — ${problems} with a mismatch, ${noQid.length} without a wikidataId.`,
  );
  console.log("Awards and producer are printed, not checked: verify claims about them by eye.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
