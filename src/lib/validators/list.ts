import { z } from "zod";

const tiptapDoc = z.record(z.string(), z.unknown()).nullable().optional();

export const listFormSchema = z.object({
  slug: z
    .string()
    .min(1, "slug 不能为空")
    .regex(/^[a-z0-9-]+$/, "仅小写字母、数字和连字符"),
  title: z.string().min(1, "标题不能为空"),
  theme: z.string().optional(),
  intro: tiptapDoc,
  sortOrder: z.coerce.number<number>().int(),
});

export type ListFormValues = z.infer<typeof listFormSchema>;
