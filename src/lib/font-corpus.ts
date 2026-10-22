/**
 * The text the public site renders in its serif, modelled page by page
 * from checked-in sources — the seed corpus, the dictionaries, and the
 * string literals of public components. `scripts/generate-fonts.ts`
 * subsets Noto Serif SC to exactly these code points and buckets them by
 * how many pages share them (ADR 0018); the coverage test holds the
 * committed subset to the same model.
 *
 * Deliberately a model, not a crawl: it must be a pure function of the
 * repo (no build, no database), so regenerating is deterministic. The
 * price is approximation — e.g. every zh page is assumed to carry all UI
 * copy — which `bun run fonts:report` measures against real prerendered
 * pages. Text editors add later in the admin is not here by design: it
 * falls through to the Fontsource slices (same glyphs, loaded late).
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { TiptapDoc } from "@/db/schema/types";
import { seedActors } from "@/db/seed-data/actors";
import { seedDirectors } from "@/db/seed-data/directors";
import { seedFilms } from "@/db/seed-data/films";
import { seedLists } from "@/db/seed-data/lists";
import { seedTags } from "@/db/seed-data/tags";
import { en } from "@/i18n/dictionaries/en";
import { zh } from "@/i18n/dictionaries/zh";

/** One rendered page: what it sets in regular (400) and bold (700). */
export type FontPage = { id: string; regular: string; bold: string };

/**
 * Public source whose literals render in the serif. Admin is excluded —
 * it sets its chrome in the system sans.
 */
export const UI_SOURCE_DIRS = [
  "src/app/[lang]",
  "src/components/auth",
  "src/components/film",
  "src/components/i18n",
  "src/components/list",
  "src/components/person",
  "src/components/site",
  "src/components/ui",
  "src/components/user",
];

/**
 * Code points worth a glyph: printable, non-control. Everything below
 * U+0020 and the C1 controls are dropped; ASCII stays in, because zh
 * pages set their Latin (years, original titles) in Noto Serif SC too.
 */
export function glyphCodePoints(text: string): Set<number> {
  const out = new Set<number>();
  for (const ch of text) {
    const cp = ch.codePointAt(0) as number;
    if (cp < 0x20 || (cp >= 0x7f && cp < 0xa0)) continue;
    out.add(cp);
  }
  return out;
}

/** Tiptap doc → its text split by weight: headings and bold runs are 700. */
export function docRuns(doc: TiptapDoc | undefined | null): { regular: string; bold: string } {
  const regular: string[] = [];
  const bold: string[] = [];
  const walk = (node: unknown, inBold: boolean) => {
    if (!node || typeof node !== "object") return;
    const n = node as {
      type?: string;
      text?: string;
      marks?: { type?: string }[];
      content?: unknown[];
    };
    const isBold = inBold || n.type === "heading" || !!n.marks?.some((m) => m.type === "bold");
    if (typeof n.text === "string") (isBold ? bold : regular).push(n.text);
    for (const c of n.content ?? []) walk(c, isBold);
  };
  walk(doc, false);
  return { regular: regular.join("\n"), bold: bold.join("\n") };
}

function dictStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (value && typeof value === "object")
    for (const v of Object.values(value)) dictStrings(v, out);
  return out;
}

function walkSources(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walkSources(path, out);
    else if (/\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(path);
  }
  return out;
}

/** Strip comments so prose in doc comments doesn't count as rendered copy. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`\\])\/\/.*$/gm, "$1");
}

/**
 * Which pages a source file's literals land on. First match wins; files
 * matching nothing (header, footer, cards, dialogs, ui primitives) are
 * chrome and count on every page, as do both dictionaries (they exist
 * for shared components only).
 */
const UI_GROUPS: [group: UiGroup, prefix: string][] = [
  ["film", "src/components/film/"],
  ["film", "src/app/[lang]/film/"],
  ["film", "src/components/site/mark-buttons"],
  ["person", "src/components/person/"],
  ["person", "src/app/[lang]/director/"],
  ["person", "src/app/[lang]/actor/"],
  ["list", "src/components/list/"],
  ["list", "src/app/[lang]/list/"],
  ["list", "src/components/site/follow-button"],
  ["films", "src/app/[lang]/films/"],
  ["lists", "src/app/[lang]/lists/"],
  ["home", "src/app/[lang]/page.tsx"],
  ["about", "src/app/[lang]/about/"],
  ["search", "src/app/[lang]/search/"],
  ["auth", "src/components/auth/"],
  ["auth", "src/app/[lang]/sign-"],
  ["auth", "src/app/[lang]/forgot-password/"],
  ["auth", "src/app/[lang]/reset-password/"],
  ["auth", "src/app/[lang]/invite/"],
  ["user", "src/components/user/"],
  ["user", "src/app/[lang]/account/"],
  ["user", "src/app/[lang]/u/"],
  ["user", "src/app/[lang]/me/"],
];
export type UiGroup =
  | "chrome"
  | "film"
  | "person"
  | "list"
  | "films"
  | "lists"
  | "home"
  | "about"
  | "search"
  | "auth"
  | "user";

/** Chrome that addresses /en readers in Chinese (switchers label themselves in the target language). */
const EN_CJK_SOURCES = [
  "src/components/site/lang-toggle.tsx",
  "src/components/site/locale-switch.tsx",
  "src/components/site/lang-hint-banner.tsx",
];

/** Non-ASCII literals of public source, grouped by the pages they render on. */
export function uiText(root: string): Record<UiGroup, string> {
  const out: Record<UiGroup, string[]> = {
    chrome: [...dictStrings(zh), ...dictStrings(en)],
    film: [],
    person: [],
    list: [],
    films: [],
    lists: [],
    home: [],
    about: [],
    search: [],
    auth: [],
    user: [],
  };
  for (const dir of UI_SOURCE_DIRS) {
    for (const file of walkSources(join(root, dir))) {
      const rel = file.slice(root.length + 1);
      const group = UI_GROUPS.find(([, prefix]) => rel.startsWith(prefix))?.[0] ?? "chrome";
      out[group].push(stripComments(readFileSync(file, "utf8")).replace(/[\x20-\x7e]/g, ""));
    }
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.join("\n")])) as Record<
    UiGroup,
    string
  >;
}

const join_ = (...xs: (string | null | undefined | false)[]) => xs.filter(Boolean).join("\n");

/**
 * Every public page the corpus produces, zh and en. A page carries the
 * chrome, its route's UI copy and its data; UI copy is counted in both
 * weights because headings are set bold.
 */
export function fontPages(root: string): FontPage[] {
  const ui = uiText(root);
  const ascii = Array.from({ length: 0x5f }, (_, i) => String.fromCharCode(0x20 + i)).join("");
  const zhPage = (
    id: string,
    group: UiGroup | null,
    regular: string[],
    bold: string[],
  ): FontPage => {
    const copy = join_(ui.chrome, group && ui[group]);
    return { id: `zh/${id}`, regular: join_(ascii, copy, ...regular), bold: join_(copy, ...bold) };
  };
  // /en sets Latin in Source Serif / Playfair; only the CJK it carries
  // (brand, the 中文 switchers, the hint banner, zh title variants)
  // reaches this family.
  const enCjk = Array.from(
    join_(
      "八部半",
      dictStrings(en).join(""),
      ...EN_CJK_SOURCES.map((f) => stripComments(readFileSync(join(root, f), "utf8"))),
    ),
  )
    .filter((ch) => (ch.codePointAt(0) as number) >= 0x2e80)
    .join("");
  const enPage = (id: string, regular: string[] = []): FontPage => ({
    id: `en/${id}`,
    regular: join_(enCjk, ...regular),
    bold: "八部半",
  });

  const people = [...seedDirectors, ...seedActors];
  const personBySlug = new Map(people.map((p) => [p.slug, p]));
  const filmBySlug = new Map(seedFilms.map((f) => [f.slug, f]));
  const tagBySlug = new Map(seedTags.map((t) => [t.slug, t]));
  const directorNames = (slugs: string[]) =>
    slugs.map((s) => personBySlug.get(s)?.nameZh ?? "").join(" ");
  const titleVariants = (f: (typeof seedFilms)[number]) =>
    join_(f.titleZh, f.titleZhHk, f.titleZhTw, f.titleOriginal);
  const cardRegular = (f: (typeof seedFilms)[number]) =>
    join_(f.titleZhHk, f.titleOriginal, String(f.year), directorNames(f.directorSlugs));

  const pages: FontPage[] = [];

  for (const f of seedFilms) {
    const essay = docRuns(f.essay);
    const lists = seedLists.filter((l) => l.items.some((i) => i.filmSlug === f.slug));
    pages.push(
      zhPage(
        `film/${f.slug}`,
        "film",
        [
          titleVariants(f),
          f.introduction,
          f.editorialNote ?? "",
          f.restorationNote ?? "",
          f.countries.join(" "),
          directorNames(f.directorSlugs),
          (f.tagSlugs ?? []).map((s) => tagBySlug.get(s)?.nameZh).join(" "),
          // The zh cast table shows characterZh ?? character.
          (f.cast ?? [])
            .map((c) => join_(c.zhName, c.name, c.characterZh ?? c.character))
            .join(" "),
          (f.watchLinks ?? []).map((w) => join_(w.platform, w.note)).join(" "),
          lists.map((l) => l.theme).join(" "),
          essay.regular,
        ],
        [f.titleZh, essay.bold, lists.map((l) => l.title).join(" ")],
      ),
      enPage(`film/${f.slug}`, [titleVariants(f)]),
    );
  }

  for (const p of people) {
    const essay = docRuns(p.careerEssay);
    const films = seedFilms.filter(
      (f) =>
        f.directorSlugs.includes(p.slug) || (f.cast ?? []).some((c) => c.personSlug === p.slug),
    );
    pages.push(
      zhPage(
        `person/${p.slug}`,
        "person",
        [p.name, p.bio, p.editorialNote ?? "", essay.regular, ...films.map(cardRegular)],
        [p.nameZh, essay.bold, ...films.map((f) => f.titleZh)],
      ),
      enPage(`person/${p.slug}`),
    );
  }

  for (const l of seedLists) {
    const intro = docRuns(l.intro);
    const films = l.items.map((i) => filmBySlug.get(i.filmSlug)).filter((f) => !!f);
    const reasons = l.items.map((i) => docRuns(i.reasoning));
    pages.push(
      zhPage(
        `list/${l.slug}`,
        "list",
        [l.theme ?? "", intro.regular, ...reasons.map((r) => r.regular), ...films.map(cardRegular)],
        [l.title, intro.bold, ...reasons.map((r) => r.bold), ...films.map((f) => f.titleZh)],
      ),
      enPage(`list/${l.slug}`),
    );
  }

  const featured = [...seedLists].sort((a, b) => a.sortOrder - b.sortOrder)[0];
  const recent = seedFilms.slice(0, 4);
  pages.push(
    zhPage(
      "films",
      "films",
      [
        ...seedFilms.map(cardRegular),
        ...seedFilms.flatMap((f) => f.countries),
        ...seedTags.map((t) => t.nameZh),
      ],
      seedFilms.map((f) => f.titleZh),
    ),
    zhPage(
      "lists",
      "lists",
      seedLists.map((l) => l.theme ?? ""),
      seedLists.map((l) => l.title),
    ),
    zhPage(
      "home",
      "home",
      [featured?.theme ?? "", ...recent.map(cardRegular)],
      [featured?.title ?? "", ...recent.map((f) => f.titleZh)],
    ),
    zhPage("about", "about", [], []),
    zhPage("search", "search", [], []),
    zhPage("sign-in", "auth", [], []),
    zhPage("account", "user", [], []),
  );
  for (const id of ["films", "lists", "home", "about", "search", "sign-in", "account"]) {
    pages.push(enPage(id));
  }
  return pages;
}

/** Every code point the corpus asks the serif for, either weight. */
export function corpusCodePoints(root: string): Set<number> {
  const all = new Set<number>();
  for (const p of fontPages(root)) {
    for (const cp of glyphCodePoints(p.regular)) all.add(cp);
    for (const cp of glyphCodePoints(p.bold)) all.add(cp);
  }
  return all;
}
