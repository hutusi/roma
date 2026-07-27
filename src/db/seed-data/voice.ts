/**
 * Machine-checkable register rules for the editorial corpus.
 *
 * The first design of this lint rewarded length dispersion, because in an
 * argumentative register uniformity was the machine tell — 74 notes inside
 * a 40-character band on a 300-character allowance. Encyclopedic prose has
 * a canonical arc (identification, plot, production, reception), so uniform
 * length is a genre convention here and that rule would fire on every good
 * introduction. It is gone.
 *
 * What replaces it: the failure mode of a neutral register is not "sounds
 * machine-written", it is "asserts something unverifiable". So the rules
 * look for claims no source could support, and for the register bleeding
 * across fields that have different jobs.
 *
 * That last part is why rules declare the families they apply to. A
 * superlative in an 影片介绍 is a defect; the same superlative in an
 * 编辑札记 is the field working as intended. One rule set applied flatly
 * to both would either gut the notes or excuse the introductions.
 *
 * Pure — no DB, no React, no filesystem. `voice.test.ts` unit-tests the
 * rules against inline fixtures and asserts them over the real corpus;
 * `voice-report.ts` prints the same findings for a human.
 */
import type { TiptapDoc } from "@/db/schema/types";
import {
  codePointLength,
  EDITORIAL_NOTE_EN_MAX,
  EDITORIAL_NOTE_MAX,
  INTRODUCTION_EN_MAX,
  INTRODUCTION_EN_MIN,
  INTRODUCTION_MAX,
  INTRODUCTION_MIN,
  wordCount,
} from "../../lib/validators/film";
import { seedActors } from "./actors";
import { seedDirectors } from "./directors";
import { seedFilms } from "./films";
import { seedLists } from "./lists";

export type Lang = "zh" | "en";

export type Family =
  /** Neutral, encyclopedic, gates publishing. */
  | "film.introduction"
  | "person.introduction"
  | "list.theme"
  | "list.intro"
  /** An editor's own voice, optional, capped. */
  | "film.note"
  | "person.note"
  /** Long-form; register follows the field it sits under. */
  | "film.essay"
  | "person.careerEssay"
  /** 入选理由 — neutral, like every other descriptive field (ADR 0017). */
  | "list.reasoning";

/**
 * Everything descriptive. With 入选理由 neutral too, the editorial
 * position lives in exactly three places: what is included, the order it
 * is included in, and 编辑札记. No descriptive field carries a view.
 */
const NEUTRAL: Family[] = [
  "film.introduction",
  "person.introduction",
  "list.theme",
  "list.intro",
  "list.reasoning",
  // The long forms are the body to the introduction's lead, not a licence
  // to editorialise at length: they carry production history, sourcing and
  // reception that will not fit the introduction's 500-code-point band.
  "film.essay",
  "person.careerEssay",
];
const VOICED: Family[] = ["film.note", "person.note"];
const ALL_FAMILIES: Family[] = [...NEUTRAL, ...VOICED];
/** A 片单 states things about entities it links to; those had better agree. */
const LIST_FAMILIES: Family[] = ["list.theme", "list.intro", "list.reasoning"];

/**
 * Every spelling the catalogue itself uses. Built once — the corpus is
 * static within a run, and the near-miss check below is O(names × prose).
 */
const namesCache = new Map<Lang, string[]>();
function canonicalNames(lang: Lang): string[] {
  let names = namesCache.get(lang);
  if (!names) {
    const people = [...seedDirectors, ...seedActors];
    // A Latin character carries less information than a CJK one, so a
    // one-character difference between short Latin names says much less. The
    // higher floor there keeps the rule from pairing up unrelated surnames.
    const floor = lang === "zh" ? 4 : 8;
    names = people
      .map((p) => (lang === "zh" ? p.nameZh : p.name))
      .filter((n): n is string => typeof n === "string" && n.length >= floor);
    namesCache.set(lang, names);
  }
  return names;
}

let titlesCache: Set<string> | undefined;
function canonicalTitles(): Set<string> {
  titlesCache ??= new Set(
    seedFilms.flatMap((f) =>
      [f.titleZh, f.titleZhHk, f.titleZhTw, f.titleOriginal, f.titleEn].filter(
        (t): t is string => typeof t === "string",
      ),
    ),
  );
  return titlesCache;
}

/**
 * Same length, exactly one character different. Deliberately not a general
 * edit distance: a substitution is what a wrong transliteration looks like
 * (葛→格), while an insertion or deletion usually means a genuinely different
 * word sitting next to a name, which would make this rule cry wolf.
 */
function differsByOne(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i] && ++diff > 1) return false;
  }
  return diff === 1;
}

export type ProseUnit = {
  id: string;
  family: Family;
  lang: Lang;
  text: string;
  /** Films only — what an introduction is expected to name. */
  directors?: string[];
  year?: number;
};

export type Finding = {
  rule: string;
  severity: "block" | "advise";
  unit: string;
  family: Family;
  lang: Lang;
  detail: string;
};

/** Flatten a Tiptap doc to its text. Deliberately not `hasProse` from
 *  validators/prose, which builds the ProseMirror schema and pulls in
 *  @/components/tiptap — this file must stay dependency-light. */
export function docText(doc: TiptapDoc | undefined | null): string {
  if (!doc) return "";
  const parts: string[] = [];
  const walk = (n: unknown) => {
    if (!n || typeof n !== "object") return;
    const node = n as { text?: string; content?: unknown[] };
    if (typeof node.text === "string") parts.push(node.text);
    for (const c of node.content ?? []) walk(c);
  };
  walk(doc);
  return parts.join("\n");
}

/** Flatten every authored prose field in seed-data into one list. */
export function proseUnits(): ProseUnit[] {
  const units: ProseUnit[] = [];
  const people = [...seedDirectors, ...seedActors];
  const personName = (slug: string) => {
    const p = people.find((x) => x.slug === slug);
    return { zh: p?.nameZh ?? p?.name ?? slug, en: p?.name ?? slug };
  };

  const push = (
    id: string,
    family: Family,
    lang: Lang,
    text: string | undefined,
    extra?: Partial<ProseUnit>,
  ) => {
    if (text?.trim()) units.push({ id, family, lang, text, ...extra });
  };

  for (const f of seedFilms) {
    const dirs = f.directorSlugs.map(personName);
    const meta = { year: f.year };
    push(`film:${f.slug}`, "film.introduction", "zh", f.introduction, {
      ...meta,
      directors: dirs.map((d) => d.zh),
    });
    push(`film:${f.slug}`, "film.introduction", "en", f.introductionEn, {
      ...meta,
      directors: dirs.map((d) => d.en),
    });
    push(`film:${f.slug}`, "film.note", "zh", f.editorialNote);
    push(`film:${f.slug}`, "film.note", "en", f.editorialNoteEn);
    push(`film:${f.slug}`, "film.essay", "zh", docText(f.essay));
    push(`film:${f.slug}`, "film.essay", "en", docText(f.essayEn));
  }

  for (const p of people) {
    push(`person:${p.slug}`, "person.introduction", "zh", p.bio);
    push(`person:${p.slug}`, "person.introduction", "en", p.bioEn);
    push(`person:${p.slug}`, "person.note", "zh", p.editorialNote);
    push(`person:${p.slug}`, "person.note", "en", p.editorialNoteEn);
    push(`person:${p.slug}`, "person.careerEssay", "zh", docText(p.careerEssay));
    push(`person:${p.slug}`, "person.careerEssay", "en", docText(p.careerEssayEn));
  }

  for (const l of seedLists) {
    push(`list:${l.slug}`, "list.theme", "zh", l.theme);
    push(`list:${l.slug}`, "list.theme", "en", l.themeEn);
    push(`list:${l.slug}`, "list.intro", "zh", docText(l.intro));
    push(`list:${l.slug}`, "list.intro", "en", docText(l.introEn));
    for (const it of l.items) {
      push(`list:${l.slug}/${it.filmSlug}`, "list.reasoning", "zh", docText(it.reasoning));
      push(`list:${l.slug}/${it.filmSlug}`, "list.reasoning", "en", docText(it.reasoningEn));
    }
  }

  return units;
}

type Rule = {
  id: string;
  severity: "block" | "advise";
  families: Family[];
  langs?: Lang[];
  /** Return a message when the unit violates the rule, else null. */
  check: (u: ProseUnit) => string | null;
};

const hits = (text: string, re: RegExp) => [...text.matchAll(re)].map((m) => m[0]);
const list = (xs: string[]) => [...new Set(xs)].slice(0, 4).join("、");

/**
 * Unfalsifiable evaluation. The tell was never the superlative itself —
 * the owner's own prose uses 最X的 freely — it is the frame that bets
 * against everything: 电影史上最 stakes a claim on all of film history,
 * where 全片最好的 is bounded by the one film.
 */
const ZH_UNBOUNDED =
  /(电影史上|影史|世界电影|所有电影|人类历史)[^。，]{0,6}最|最伟大的[^。，]{0,8}(电影|作品|导演)|不朽的?(杰作|经典)|永恒的/g;
const EN_UNBOUNDED =
  /\b(the )?(greatest|finest|most \w+)\b[^.]{0,40}\b(ever|of all time|in (the )?(history|cinema))\b|\bmasterpiece\b|\bimmortal\b|\btimeless\b|\bdefinitive\b/gi;

/** Reference prose does not address the reader or tell them what to do. */
const ZH_SECOND_PERSON = /(^|[，。；：])(你|您|我们|咱们)|不妨|请务必|值得你|如果你/g;
// The pronoun list must not swallow proper nouns. "You An-shun" is a cast
// credit; "In Our Time", "In Which We Serve" and "The Children Are Watching
// Us" are titles. All of them capitalise mid-sentence, and a real address to
// the reader does not, so only lowercase pronouns match — plus the
// capitalised forms where a sentence actually starts. Same class of false
// positive as the case-sensitive director check in verify-facts: a rule that
// cries wolf on correct prose gets ignored.
const EN_SECOND_PERSON =
  /\b(you|your|we|us|our)\b|(?<=^|[.!?]\s)(?!(?:You|Your|We|Us|Our)\s+[A-Z])(You|Your|We|Us|Our)\b|\b([Ww]atch|[Ss]ee|[Nn]ote|[Ii]magine|[Cc]onsider) (it|this|the film)\b/g;

export const RULES: Rule[] = [
  {
    id: "introduction-length",
    severity: "block",
    families: ["film.introduction"],
    check: (u) => {
      if (u.lang === "zh") {
        const n = codePointLength(u.text.trim());
        return n < INTRODUCTION_MIN || n > INTRODUCTION_MAX
          ? `${n} code points (need ${INTRODUCTION_MIN}–${INTRODUCTION_MAX})`
          : null;
      }
      const n = wordCount(u.text);
      return n < INTRODUCTION_EN_MIN || n > INTRODUCTION_EN_MAX
        ? `${n} words (need ${INTRODUCTION_EN_MIN}–${INTRODUCTION_EN_MAX})`
        : null;
    },
  },
  {
    // The encyclopedic minimum. seed-content enforces the length gate at
    // run time but nothing checks that the prose identifies its subject.
    id: "introduction-identifies-film",
    severity: "block",
    families: ["film.introduction"],
    check: (u) => {
      const missing: string[] = [];
      if (u.year && !u.text.includes(String(u.year))) missing.push(`year ${u.year}`);
      if (u.directors?.length && !u.directors.some((d) => u.text.includes(d))) {
        missing.push(`director (${u.directors.join(" / ")})`);
      }
      return missing.length ? `does not name ${missing.join(" or ")}` : null;
    },
  },
  {
    id: "note-ceiling",
    severity: "block",
    families: VOICED,
    check: (u) => {
      if (u.lang === "zh") {
        const n = codePointLength(u.text.trim());
        return n > EDITORIAL_NOTE_MAX ? `${n} code points (max ${EDITORIAL_NOTE_MAX})` : null;
      }
      const n = wordCount(u.text);
      return n > EDITORIAL_NOTE_EN_MAX ? `${n} words (max ${EDITORIAL_NOTE_EN_MAX})` : null;
    },
  },
  {
    id: "unfalsifiable-claim",
    severity: "block",
    families: NEUTRAL,
    check: (u) => {
      const found = hits(u.text, u.lang === "zh" ? ZH_UNBOUNDED : EN_UNBOUNDED);
      return found.length ? `unverifiable evaluation: ${list(found)}` : null;
    },
  },
  {
    id: "addresses-the-reader",
    severity: "block",
    families: NEUTRAL,
    check: (u) => {
      const found = hits(u.text, u.lang === "zh" ? ZH_SECOND_PERSON : EN_SECOND_PERSON);
      return found.length ? `second person or imperative: ${list(found)}` : null;
    },
  },
  {
    // humanizer §14, as modified by its own Voice Calibration clause: a
    // writing sample outranks the rule, and one exists for Chinese
    // (hutusi.com, 1.13 per 1000 characters) but not for English.
    id: "en-em-dash",
    severity: "block",
    families: ALL_FAMILIES,
    langs: ["en"],
    check: (u) => {
      // An en dash between digits is a numeric range (1920–1993), which is
      // correct typography and not the rhetorical dash §14 is about. Without
      // this exclusion the rule fires on every bio's date span and reports
      // nothing but noise, which is how it hid real findings for two batches.
      const n = hits(u.text, /—|–(?!\d)|(?<!\d)–/g).length;
      return n ? `${n} em/en dash(es); English prose carries none` : null;
    },
  },
  {
    /**
     * A film or person named in list prose must be spelled the way the
     * catalogue spells it, because both render on the same journey: the list
     * page says one thing and the page it links to says another.
     *
     * Near-miss rather than membership, which is the only workable test here.
     * List prose legitimately names people who are not in the corpus at all —
     * cinematographers, composers, novelists — so "must be a catalogued
     * person" would fire constantly. One character off a catalogued name is
     * not a different person, it is a typo: 格洛丽亚·斯旺森 for the
     * 葛洛丽亚·斯旺森 that actors.ts and the sunset-boulevard cast both use.
     */
    id: "name-near-miss",
    severity: "block",
    families: LIST_FAMILIES,
    check: (u) => {
      const found: string[] = [];
      for (const canonical of canonicalNames(u.lang)) {
        if (u.text.includes(canonical)) continue;
        for (let i = 0; i + canonical.length <= u.text.length; i++) {
          const window = u.text.slice(i, i + canonical.length);
          if (differsByOne(window, canonical)) {
            found.push(`${window} → ${canonical}`);
            break;
          }
        }
      }
      return found.length ? `not the catalogue's spelling: ${list(found)}` : null;
    },
  },
  {
    /**
     * Advisory, not blocking. Every 《X》 in list prose that the catalogue
     * does not carry gets listed for a human to glance at. It cannot block:
     * the prose properly cites songs (《四季歌》), magazines (《电影手册》),
     * novels (《德古拉》) and films outside the catalogue (《西鹤一代女》), and
     * an allowlist covering those would go stale faster than it would help.
     * Seven entries today, which is short enough to read.
     */
    id: "title-outside-catalogue",
    severity: "advise",
    families: LIST_FAMILIES,
    langs: ["zh"],
    check: (u) => {
      const canonical = canonicalTitles();
      const found = [...u.text.matchAll(/《([^》]+)》/g)]
        .map((m) => m[1])
        .filter((t) => !canonical.has(t));
      return found.length ? `not a catalogued title: ${list(found.map((t) => `《${t}》`))}` : null;
    },
  },
  {
    // Advisory: a shared opening is normal in reference prose (《X》是…)
    // and only a tell when it spreads. Reported, never blocking.
    id: "shared-opening",
    severity: "advise",
    families: NEUTRAL,
    check: () => null, // corpus-level; computed in runVoiceChecks
  },
];

/** Corpus-level checks that need every unit at once, not one at a time. */
function corpusFindings(units: ProseUnit[]): Finding[] {
  const out: Finding[] = [];
  const byFamilyLang = new Map<string, ProseUnit[]>();
  for (const u of units) {
    const k = `${u.family}|${u.lang}`;
    byFamilyLang.set(k, [...(byFamilyLang.get(k) ?? []), u]);
  }
  for (const [key, group] of byFamilyLang) {
    if (group.length < 8) continue;
    const [family, lang] = key.split("|") as [Family, Lang];
    if (!NEUTRAL.includes(family)) continue;
    const opener = (t: string) => t.trim().slice(0, 6);
    const counts = new Map<string, number>();
    for (const u of group) counts.set(opener(u.text), (counts.get(opener(u.text)) ?? 0) + 1);
    const [top, n] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? ["", 0];
    if (n / group.length > 0.6) {
      out.push({
        rule: "shared-opening",
        severity: "advise",
        unit: `${family} (${lang})`,
        family,
        lang,
        detail: `${n}/${group.length} open with "${top}"`,
      });
    }
  }
  return out;
}

export function runVoiceChecks(units: ProseUnit[]): Finding[] {
  const out: Finding[] = [];
  for (const u of units) {
    for (const rule of RULES) {
      if (!rule.families.includes(u.family)) continue;
      if (rule.langs && !rule.langs.includes(u.lang)) continue;
      const detail = rule.check(u);
      if (detail) {
        out.push({
          rule: rule.id,
          severity: rule.severity,
          unit: u.id,
          family: u.family,
          lang: u.lang,
          detail,
        });
      }
    }
  }
  return [...out, ...corpusFindings(units)];
}

export const blocking = (f: Finding[]) => f.filter((x) => x.severity === "block");
