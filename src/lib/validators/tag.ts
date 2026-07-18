import { z } from "zod";

/**
 * Both names are required at creation — the vocabulary is bilingual by
 * construction (ADR 0014), so a tag can never surface untranslated on
 * /en. Slug rules mirror the other entities (see slug.test.ts).
 */
export const tagFormSchema = z.object({
  slug: z
    .string()
    .min(1, "slug 不能为空")
    .regex(/^[a-z0-9-]+$/, "仅小写字母、数字和连字符"),
  nameZh: z.string().trim().min(1, "中文名不能为空").max(30, "中文名不能超过 30 字"),
  nameEn: z.string().trim().min(1, "英文名不能为空").max(60, "英文名不能超过 60 字符"),
});

export type TagFormValues = z.infer<typeof tagFormSchema>;
