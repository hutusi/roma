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
