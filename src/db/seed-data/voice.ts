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
];
const VOICED: Family[] = ["film.note", "person.note"];
const ALL_FAMILIES: Family[] = [...NEUTRAL, ...VOICED, "film.essay", "person.careerEssay"];

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
// The pronoun list must not swallow proper names: "You An-shun as the
// teenage Ah-ha" is a cast credit, not an address to the reader. A capital
// followed by another capitalised word is a name, so it is excluded. Same
// class of false positive as the case-sensitive director check in
// verify-facts — a rule that cries wolf on correct prose gets ignored.
const EN_SECOND_PERSON =
  /\b(?!You\s+[A-Z])(you|your|we|us|our)\b|\b(watch|see|note|imagine|consider) (it|this|the film)\b/gi;

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
      const n = hits(u.text, /—|–/g).length;
      return n ? `${n} em/en dash(es); English prose carries none` : null;
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
