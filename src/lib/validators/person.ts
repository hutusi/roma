import { z } from "zod";
import { codePointLength, EDITORIAL_NOTE_EN_MAX, EDITORIAL_NOTE_MAX, wordCount } from "./film";
import { tiptapDocSchema } from "./prose";

export const personFormSchema = z.object({
  slug: z
    .string()
    .min(1, "slug 不能为空")
    .regex(/^[a-z0-9-]+$/, "仅小写字母、数字和连字符"),
  name: z.string().min(1, "姓名不能为空"),
  nameZh: z.string().optional(),
  /** Picks the canonical URL segment (/director vs /actor). */
  primaryRole: z.enum(["director", "actor"]),
  /** 人物介绍 — also the card blurb and meta description. */
  bio: z.string().optional(),
  careerEssay: tiptapDocSchema,
  bioEn: z.string().optional(),
  careerEssayEn: tiptapDocSchema,
  /** 编辑札记 — same ceiling-not-floor rule as films. */
  editorialNote: z
    .string()
    .optional()
    .refine(
      (s) => !s || codePointLength(s) <= EDITORIAL_NOTE_MAX,
      `编辑札记不能超过 ${EDITORIAL_NOTE_MAX} 字`,
    ),
  editorialNoteEn: z
    .string()
    .optional()
    .refine(
      (s) => !s || wordCount(s) <= EDITORIAL_NOTE_EN_MAX,
      `英文札记不能超过 ${EDITORIAL_NOTE_EN_MAX} 词`,
    ),
});

export type PersonFormValues = z.infer<typeof personFormSchema>;

/**
 * Publishing is stricter than saving a draft — mirrors
 * validators/film.ts. This lived inline in publishPerson, which is why
 * savePerson never re-ran it: a published person could be saved with
 * both fields empty and stay live with neither. Keep gates here so both
 * the publish action and the save guard read the same rule.
 */
export function publishProblems(person: {
  bio: string | null;
  editorialNote?: string | null;
}): string[] {
  const problems: string[] = [];
  // 人物介绍 is required, not one of two alternatives. It was an either/or
  // until ADR 0017 gave the field a job beyond the page it sits on: it is
  // the card blurb on every listing and the meta description, sliced to 160
  // characters. A person published on 创作历程 alone therefore rendered a
  // blank card and empty metadata, and the English gate below already
  // required bioEn — zh being the laxer of the two was backwards.
  if (!person.bio?.trim()) {
    problems.push("发布前请填写人物介绍");
  }
  const noteLen = codePointLength((person.editorialNote ?? "").trim());
  if (noteLen > EDITORIAL_NOTE_MAX) {
    problems.push(`编辑札记不能超过 ${EDITORIAL_NOTE_MAX} 字（当前 ${noteLen} 字）`);
  }
  return problems;
}

/**
 * Gate for the English edition; the career essay stays optional. Mirrors
 * publishEnProblems in validators/film.ts, note ceiling included — without
 * it an over-long English note was caught only by the form schema and rode
 * straight through the seed and resync paths.
 */
export function publishEnProblems(person: {
  bioEn: string | null;
  editorialNoteEn?: string | null;
}): string[] {
  const problems: string[] = [];
  if (!person.bioEn?.trim()) problems.push("缺少英文简介（bioEn）");
  const noteWords = wordCount((person.editorialNoteEn ?? "").trim());
  if (noteWords > EDITORIAL_NOTE_EN_MAX) {
    problems.push(`英文札记不能超过 ${EDITORIAL_NOTE_EN_MAX} 词（当前 ${noteWords} 词）`);
  }
  return problems;
}

export const viewingOrderSchema = z
  .array(
    z.object({
      filmId: z.string(),
      note: z.string().optional(),
      noteEn: z.string().optional(),
    }),
  )
  .refine(
    (items) => items.length === new Set(items.map((item) => item.filmId)).size,
    "观看顺序不能重复包含同一部影片",
  );
