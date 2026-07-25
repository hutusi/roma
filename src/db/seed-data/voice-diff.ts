/**
 * Read the editorial prose of named films from git and print the old text
 * against the new, zh and en adjacent. The review instrument for a prose
 * rewrite: `git diff` on films.ts renders as a wall of CJK inside TypeScript
 * string literals, which is unreadable at the only granularity that matters
 * here — the paragraph.
 *
 * Read-only and DB-free. It shells out to `git show <ref>:<path>` and
 * evaluates the two revisions of seed-data in a child bun process, so it can
 * compare a working tree against any ref without checking anything out.
 *
 * Compares against the branch point (merge-base with main) unless --ref says
 * otherwise, so it keeps working after the rewrite is committed.
 *
 *   bun run src/db/seed-data/voice-diff.ts --films=otto-e-mezzo,tokyo-story
 *   bun run src/db/seed-data/voice-diff.ts --all --stats        # lengths only
 *   bun run src/db/seed-data/voice-diff.ts --all --ref=HEAD~3   # explicit ref
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { codePointLength, wordCount } from "../../lib/validators/film";
import { seedFilms } from "./films";

const arg = (name: string): string | undefined => {
  const p = process.argv.find((a) => a.startsWith(`--${name}=`));
  return p?.slice(name.length + 3);
};
const flag = (name: string) => process.argv.includes(`--${name}`);

/**
 * Default to where this branch left main, not to HEAD. A prose rewrite is
 * reviewed for far longer than it sits uncommitted, and against HEAD every
 * committed rewrite reports "identical" — the one output that looks like a
 * working tool and answers nothing. On main the merge-base is HEAD anyway,
 * so this stays correct there.
 */
function defaultRef(): string {
  const base = Bun.spawnSync(["git", "merge-base", "main", "HEAD"]);
  if (base.exitCode !== 0) return "HEAD";
  return base.stdout.toString().trim() || "HEAD";
}

const REF = arg("ref") ?? defaultRef();
const STATS_ONLY = flag("stats");
const slugs = flag("all")
  ? seedFilms.map((f) => f.slug)
  : (arg("films")
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? []);

/**
 * Load `films.ts` as of `ref` by materializing the whole seed-data directory
 * into a temp dir and importing it there. Importing the single file would
 * fail: it imports ./types and ./tiptap, and TiptapDoc resolves through the
 * "@/db/schema/types" alias that only exists inside the project.
 */
async function filmsAtRef(ref: string): Promise<Map<string, Record<string, unknown>>> {
  const dir = mkdtempSync(join(tmpdir(), "voice-diff-"));
  try {
    for (const name of ["films.ts", "types.ts", "tiptap.ts"]) {
      const proc = Bun.spawnSync(["git", "show", `${ref}:src/db/seed-data/${name}`]);
      if (proc.exitCode !== 0) {
        throw new Error(`git show ${ref}:src/db/seed-data/${name} failed`);
      }
      let src = proc.stdout.toString();
      // types.ts is the only file reaching outside seed-data, and only for a
      // type-level import. Stub it so the temp copy stands alone.
      if (name === "types.ts") {
        src = src.replace(
          /import type \{ TiptapDoc \} from "@\/db\/schema\/types";/,
          "type TiptapDoc = { type: string; content?: unknown[] };",
        );
      }
      writeFileSync(join(dir, name), src);
    }
    const mod = (await import(join(dir, "films.ts"))) as { seedFilms: Record<string, unknown>[] };
    return new Map(mod.seedFilms.map((f) => [f.slug as string, f]));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Punctuation that may never open a line (禁则处理). */
const NO_LINE_START = /[，。、；：？！）」』】—…·%]/;

/**
 * Wrap on whitespace for en; on display width for zh, which has no spaces to
 * break at. Slicing zh at a fixed offset splits years down the middle and
 * strands commas at the head of a line, which makes prose written to be judged
 * by eye harder to judge. So: treat each run of Latin/digits as one unit, and
 * pull a closing mark back onto the line it belongs to.
 */
function wrap(text: string, width: number): string[] {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    if (/[一-鿿]/.test(para)) {
      // CJK glyphs are double-width in a terminal, so halve the budget.
      const per = Math.floor(width / 2);
      const units = para.match(/[A-Za-z0-9][A-Za-z0-9.,:'’-]*|\s+|./gu) ?? [];
      let line = "";
      let w = 0;
      for (const u of units) {
        // Latin/digit runs are single-width; CJK is double.
        const uw = /^[A-Za-z0-9\s]/.test(u) ? u.length / 2 : u.length;
        if (w + uw > per && line && !NO_LINE_START.test(u)) {
          out.push(line);
          line = u.trimStart();
          w = line ? uw : 0;
        } else {
          line += u;
          w += uw;
        }
      }
      if (line.trim()) out.push(line);
    } else {
      let line = "";
      for (const word of para.split(/\s+/)) {
        if (line && line.length + word.length + 1 > width) {
          out.push(line);
          line = word;
        } else {
          line = line ? `${line} ${word}` : word;
        }
      }
      if (line) out.push(line);
    }
  }
  return out.length ? out : ["(empty)"];
}

const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

function section(label: string, before: string, after: string, measure: (s: string) => number) {
  const b = measure(before);
  const a = measure(after);
  const delta = a - b === 0 ? "unchanged" : `${a - b > 0 ? "+" : ""}${a - b}`;
  console.log(`\n  ${BOLD}${label}${RESET}  ${DIM}${b} → ${a} (${delta})${RESET}`);
  if (STATS_ONLY) return;
  if (before === after) {
    console.log(`    ${DIM}(identical)${RESET}`);
    return;
  }
  console.log(`\n    ${DIM}── before ──${RESET}`);
  for (const l of wrap(before, 76)) console.log(`    ${DIM}${l}${RESET}`);
  console.log(`\n    ${DIM}── after ──${RESET}`);
  for (const l of wrap(after, 76)) console.log(`    ${l}`);
}

async function main() {
  if (!slugs.length) {
    console.error("Nothing to do. Pass --films=a,b or --all.");
    process.exit(1);
  }
  const before = await filmsAtRef(REF);
  const after = new Map(seedFilms.map((f) => [f.slug, f]));

  const shown = /^[0-9a-f]{40}$/.test(REF) ? `${REF.slice(0, 8)} (branch point)` : REF;
  console.log(`\nEditorial prose: ${shown} → working tree  (${slugs.length} film(s))`);

  const zhLens: number[] = [];
  const enLens: number[] = [];
  let missing = 0;

  for (const slug of slugs) {
    const b = before.get(slug);
    const a = after.get(slug);
    if (!a) {
      console.log(`\n${BOLD}${slug}${RESET}  ⚠ not in working tree — skipped`);
      missing++;
      continue;
    }
    if (!b) {
      console.log(`\n${BOLD}${slug}${RESET}  ⚠ not present at ${REF} (new film) — skipped`);
      missing++;
      continue;
    }
    console.log(`\n${"─".repeat(80)}\n${BOLD}${slug}${RESET}  ${a.titleZh} (${a.year})`);
    section(
      "编辑札记 (zh, code points)",
      (b.editorialNote as string) ?? "",
      (a.editorialNote as string) ?? "",
      codePointLength,
    );
    section(
      "Editorial note (en, words)",
      (b.editorialNoteEn as string) ?? "",
      (a.editorialNoteEn as string) ?? "",
      wordCount,
    );
    zhLens.push(codePointLength((a.editorialNote as string) ?? ""));
    enLens.push(wordCount((a.editorialNoteEn as string) ?? ""));
  }

  // The point of the rewrite is that lengths stop clustering, so report the
  // spread of what was actually written rather than only per-film deltas.
  const spread = (xs: number[]) => {
    if (!xs.length) return "n/a";
    const s = [...xs].sort((x, y) => x - y);
    const mean = xs.reduce((p, q) => p + q, 0) / xs.length;
    const sd = Math.sqrt(xs.reduce((p, q) => p + (q - mean) ** 2, 0) / xs.length);
    return `min ${s[0]} · med ${s[Math.floor(s.length / 2)]} · max ${s.at(-1)} · sd ${sd.toFixed(1)} · CV ${(sd / mean).toFixed(3)}`;
  };
  console.log(`\n${"─".repeat(80)}`);
  console.log(`zh spread (band 200–500): ${spread(zhLens)}`);
  console.log(`en spread (band 120–350): ${spread(enLens)}`);
  if (missing) console.log(`${missing} film(s) skipped.`);
  console.log();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
