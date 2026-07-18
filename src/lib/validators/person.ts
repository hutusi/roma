import { z } from "zod";
import { hasProse, tiptapDocSchema } from "./prose";

export const personFormSchema = z.object({
  slug: z
    .string()
    .min(1, "slug 不能为空")
    .regex(/^[a-z0-9-]+$/, "仅小写字母、数字和连字符"),
  name: z.string().min(1, "姓名不能为空"),
  nameZh: z.string().optional(),
  /** Picks the canonical URL segment (/director vs /actor). */
  primaryRole: z.enum(["director", "actor"]),
  bio: z.string().optional(),
  careerEssay: tiptapDocSchema,
  bioEn: z.string().optional(),
  careerEssayEn: tiptapDocSchema,
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
  careerEssay: Record<string, unknown> | null;
}): string[] {
  // careerEssay must actually render — an empty { type: "doc" } used to
  // pass as a truthy object while rendering nothing (see hasProse).
  return person.bio?.trim() || hasProse(person.careerEssay) ? [] : ["发布前请填写简介或创作历程"];
}

/** Gate for the English edition; the career essay stays optional. */
export function publishEnProblems(person: { bioEn: string | null }): string[] {
  return person.bioEn?.trim() ? [] : ["缺少英文简介（bioEn）"];
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
