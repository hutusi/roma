/**
 * Measures CJK serif cost per prerendered page, before vs after ADR 0018:
 *
 *   before  every Fontsource Noto Serif SC slice the page's text touches
 *   after   every "Babuban Serif SC" bucket it touches, plus the
 *           Fontsource slices still needed for glyphs outside the subset
 *           (loaded late, after hydration)
 *
 * plus the render-blocking @font-face CSS both schemes ship. Reads the
 * HTML of a production build, so run `bun run build` first (against a
 * database with the real corpus — the e2e fixture DB is too small to
 * say anything).
 *
 * Text is attributed to a weight by markup: h1–h4, <strong>/<b> and
 * `font-bold` are 700. `font-sans` subtrees are skipped (system sans);
 * `font-display` subtrees and all of /en count CJK only, since their
 * Latin is set in Playfair / Source Serif.
 *
 * Run: bun run fonts:report [--write]   (--write updates
 * docs/measurements/fonts.md)
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const APP_DIR = join(root, ".next/server/app");
const NOTO = join(root, "node_modules/@fontsource/noto-serif-sc");
const SUBSET_CSS = join(root, "src/assets/fonts/babuban-serif-sc.css");

type Face = { weight: 400 | 700; ranges: [number, number][]; bytes: number; name: string };

function parseRanges(value: string): [number, number][] {
  return value.split(",").map((part) => {
    const [a, b] = part.trim().replace(/^U\+/i, "").split("-");
    return [Number.parseInt(a, 16), Number.parseInt(b ?? a, 16)];
  });
}

function parseFaces(
  css: string,
  weightOf: (block: string) => 400 | 700,
  fileOf: (url: string) => string,
): Face[] {
  return css
    .split("@font-face")
    .slice(1)
    .map((block) => {
      const url = /url\(["']?([^"')]+\.woff2)["']?\)/.exec(block)?.[1] ?? "";
      const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1] ?? "U+0-10FFFF";
      const file = fileOf(url);
      return {
        weight: weightOf(block),
        ranges: parseRanges(range),
        bytes: statSync(file).size,
        name: url,
      };
    });
}

const weightIn = (block: string) => (/font-weight:\s*700/.test(block) ? 700 : 400) as 400 | 700;
const notoCss = ["400", "700"].map((w) => readFileSync(join(NOTO, `${w}.css`), "utf8"));
const before = notoCss.flatMap((css) =>
  parseFaces(css, weightIn, (url) => join(NOTO, url.replace(/^\.\//, ""))),
);
const subsetCss = readFileSync(SUBSET_CSS, "utf8");
const after = parseFaces(subsetCss, weightIn, (url) => join(root, "public", url));

const covers = (f: Face, cp: number) => f.ranges.some(([a, b]) => cp >= a && cp <= b);

const ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};
const decode = (s: string) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|\w+);/gi, (m, e: string) =>
    e[0] === "#"
      ? String.fromCodePoint(
          e[1] === "x" || e[1] === "X" ? Number.parseInt(e.slice(2), 16) : Number(e.slice(1)),
        )
      : (ENTITIES[e] ?? m),
  );

const VOID = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);
const BOLD_TAGS = new Set(["h1", "h2", "h3", "h4", "strong", "b"]);

/** Per-weight code points a page asks the serif CJK family for. */
function pageNeeds(html: string, en: boolean): Record<400 | 700, Set<number>> {
  const body = html
    .replace(/<head[\s\S]*?<\/head>/i, "")
    .replace(/<(script|style|template|noscript)[\s\S]*?<\/\1>/gi, "");
  const needs = { 400: new Set<number>(), 700: new Set<number>() };
  type Ctx = { tag: string; bold: boolean; display: boolean; sans: boolean };
  const stack: Ctx[] = [{ tag: "#root", bold: false, display: false, sans: false }];
  const re = /<\/?([a-zA-Z][\w-]*)([^>]*)>|([^<]+)/g;
  for (let m = re.exec(body); m; m = re.exec(body)) {
    const top = stack[stack.length - 1];
    if (m[3] !== undefined) {
      if (top.sans) continue;
      for (const ch of decode(m[3])) {
        const cp = ch.codePointAt(0) as number;
        if (cp < 0x21 || (cp >= 0x7f && cp < 0xa0)) continue;
        if ((en || top.display) && cp < 0x2e80) continue;
        needs[top.bold ? 700 : 400].add(cp);
      }
      continue;
    }
    const tag = m[1].toLowerCase();
    if (m[0][1] === "/") {
      const at = stack.map((c) => c.tag).lastIndexOf(tag);
      if (at > 0) stack.length = at;
      continue;
    }
    if (VOID.has(tag) || m[2].trimEnd().endsWith("/")) continue;
    // Exact tokens only: variants like `prose-headings:font-bold` style
    // descendants, not this element.
    const cls = new Set((/class="([^"]*)"/.exec(m[2])?.[1] ?? "").split(/\s+/));
    stack.push({
      tag,
      bold: top.bold || BOLD_TAGS.has(tag) || cls.has("font-bold"),
      display: top.display || cls.has("font-display"),
      sans: top.sans || cls.has("font-sans"),
    });
  }
  return needs;
}

function cost(faces: Face[], needs: Record<400 | 700, Set<number>>) {
  const hit = faces.filter((f) => [...needs[f.weight]].some((cp) => covers(f, cp)));
  return { files: hit.length, bytes: hit.reduce((n, f) => n + f.bytes, 0) };
}

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (name.endsWith(".html")) out.push(path);
  }
  return out;
}

type Row = {
  id: string;
  beforeKb: number;
  beforeFiles: number;
  afterKb: number;
  afterFiles: number;
  lateKb: number;
  lateGlyphs: number;
};
const rows: Row[] = [];
for (const file of walk(APP_DIR)) {
  const id = file.slice(APP_DIR.length + 1, -".html".length);
  if (!/^(zh|en)(\/|$)/.test(id)) continue;
  const needs = pageNeeds(readFileSync(file, "utf8"), id.startsWith("en"));
  const b = cost(before, needs);
  const a = cost(after, needs);
  // Glyphs the subset lacks fall through to the lazy Fontsource slices.
  const left = {
    400: new Set(
      [...needs[400]].filter((cp) => !after.some((f) => f.weight === 400 && covers(f, cp))),
    ),
    700: new Set(
      [...needs[700]].filter((cp) => !after.some((f) => f.weight === 700 && covers(f, cp))),
    ),
  };
  const late = cost(before, left);
  rows.push({
    id,
    beforeKb: b.bytes / 1024,
    beforeFiles: b.files,
    afterKb: a.bytes / 1024,
    afterFiles: a.files,
    lateKb: late.bytes / 1024,
    lateGlyphs: left[400].size + left[700].size,
  });
}
if (rows.length === 0) {
  console.error("No prerendered zh/en pages under .next/server/app — run `bun run build` first.");
  process.exit(1);
}

const GROUPS: [string, RegExp][] = [
  ["zh film pages", /^zh\/film\//],
  ["zh person pages", /^zh\/(director|actor)\//],
  ["zh list pages", /^zh\/list\//],
  ["zh index pages", /^zh(\/(films|lists|about|search|sign-in|sign-up))?$/],
  ["en pages", /^en(\/|$)/],
];
const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)] ?? 0;
};
const kb = (n: number) => `${Math.round(n)} KB`;
const lines = [
  "| Pages | n | Before (median) | After (median) | After, late fallback (median) |",
  "|---|---|---|---|---|",
];
for (const [label, re] of GROUPS) {
  const rs = rows.filter((r) => re.test(r.id));
  if (!rs.length) continue;
  lines.push(
    `| ${label} | ${rs.length} | ${kb(median(rs.map((r) => r.beforeKb)))} / ${median(rs.map((r) => r.beforeFiles))} files | ` +
      `${kb(median(rs.map((r) => r.afterKb)))} / ${median(rs.map((r) => r.afterFiles))} files | ` +
      `${kb(median(rs.map((r) => r.lateKb)))} (${median(rs.map((r) => r.lateGlyphs))} glyphs) |`,
  );
}
const cssBefore = notoCss.reduce((n, css) => n + gzipSync(css).length, 0);
const cssAfter = gzipSync(subsetCss).length;
const cssLine = `Render-blocking CJK @font-face CSS: ${(cssBefore / 1024).toFixed(1)} KB gz before → ${(cssAfter / 1024).toFixed(1)} KB gz after.`;
const worst = rows
  .filter((r) => r.lateGlyphs > 0)
  .sort((a, b) => b.lateGlyphs - a.lateGlyphs || a.id.localeCompare(b.id))
  .slice(0, 3);
const lateLine = worst.length
  ? `Most late-fallback glyphs: ${worst.map((r) => `${r.id} (${r.lateGlyphs})`).join(", ")}.`
  : "No page needs late-fallback glyphs.";

const only = process.argv.find((a) => a.startsWith("--page="))?.slice("--page=".length);
if (only) {
  for (const r of rows.filter((x) => x.id === only)) {
    console.log(
      `${r.id}: before ${kb(r.beforeKb)} / ${r.beforeFiles} files → after ${kb(r.afterKb)} / ` +
        `${r.afterFiles} files (+${kb(r.lateKb)} late, ${r.lateGlyphs} glyphs)`,
    );
  }
  process.exit(0);
}

const table = [...lines, "", cssLine, lateLine].join("\n");
console.log(table);

if (process.argv.includes("--write")) {
  const date = new Date().toISOString().slice(0, 10);
  writeFileSync(
    join(root, "docs/measurements/fonts.md"),
    `# CJK font cost per page

Cold-cache bytes of Noto Serif SC woff2 a prerendered page needs, from
\`bun run fonts:report\` (scripts/font-report.ts) against a production
build of the full corpus. "Before" is the Fontsource unicode-range slicing
ADR 0002 shipped; "after" is the generated "Babuban Serif SC" subset of
ADR 0018. "Late fallback" is Fontsource slices still fetched after
hydration for glyphs the subset lacks — it should stay near zero; when it
grows, run \`bun run fonts:generate\`.

Measured ${date}:

${table}
`,
  );
  console.log("\nWrote docs/measurements/fonts.md");
}
