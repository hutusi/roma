import { z } from "zod";
import { tiptapDocSchema } from "./prose";

export const listFormSchema = z.object({
  slug: z
    .string()
    .min(1, "slug 不能为空")
    .regex(/^[a-z0-9-]+$/, "仅小写字母、数字和连字符"),
  title: z.string().min(1, "标题不能为空"),
  theme: z.string().optional(),
  intro: tiptapDocSchema,
  titleEn: z.string().optional(),
  themeEn: z.string().optional(),
  introEn: tiptapDocSchema,
  sortOrder: z.coerce.number<number>().int(),
});

export type ListFormValues = z.infer<typeof listFormSchema>;

/**
 * Gate for the English edition. Reasoning/intro coverage is advisory
 * (shown in the publish panel), not blocking: untranslated members
 * render unlinked on /en rather than breaking the list's order.
 */
export function publishEnProblems(list: { titleEn: string | null }): string[] {
  return list.titleEn?.trim() ? [] : ["缺少英文标题（titleEn）"];
}
