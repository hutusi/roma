import { z } from "zod";

const tiptapDoc = z.record(z.string(), z.unknown()).nullable().optional();

export const directorFormSchema = z.object({
  slug: z
    .string()
    .min(1, "slug 不能为空")
    .regex(/^[a-z0-9-]+$/, "仅小写字母、数字和连字符"),
  name: z.string().min(1, "姓名不能为空"),
  nameZh: z.string().optional(),
  bio: z.string().optional(),
  careerEssay: tiptapDoc,
  bioEn: z.string().optional(),
  careerEssayEn: tiptapDoc,
});

export type DirectorFormValues = z.infer<typeof directorFormSchema>;

/**
 * Publishing is stricter than saving a draft — mirrors
 * validators/film.ts. This lived inline in publishDirector, which is why
 * saveDirector never re-ran it: a published director could be saved with
 * both fields empty and stay live with neither. Keep gates here so both
 * the publish action and the save guard read the same rule.
 */
export function publishProblems(director: {
  bio: string | null;
  careerEssay: unknown | null;
}): string[] {
  return director.bio?.trim() || director.careerEssay ? [] : ["发布前请填写简介或创作历程"];
}

/** Gate for the English edition; the career essay stays optional. */
export function publishEnProblems(director: { bioEn: string | null }): string[] {
  return director.bioEn?.trim() ? [] : ["缺少英文简介（bioEn）"];
}

export const viewingOrderSchema = z.array(
  z.object({
    filmId: z.string(),
    note: z.string().optional(),
    noteEn: z.string().optional(),
  }),
);
