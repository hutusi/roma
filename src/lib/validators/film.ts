import { z } from "zod";
import { tiptapDocSchema } from "./prose";

/**
 * Counts code points, not UTF-16 units, so CJK text measures correctly.
 */
export const codePointLength = (s: string) => Array.from(s).length;

/** English prose measures in words, not code points. */
export const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export const EDITORIAL_NOTE_MIN = 200;
export const EDITORIAL_NOTE_MAX = 500;
/** ≈ the zh 200–500 code-point band, converted to English words. */
export const EDITORIAL_NOTE_EN_MIN = 120;
export const EDITORIAL_NOTE_EN_MAX = 350;

export const castMemberSchema = z.object({
  name: z.string().min(1, "姓名不能为空"),
  nameZh: z.string().optional(),
  /** Latin/original role name — the /en form; zh prefers characterZh. */
  character: z.string().optional(),
  characterZh: z.string().optional(),
  /** Optional link to a curated person ("" means unlinked in the form). */
  personId: z.string().optional(),
});

export const watchLinkSchema = z.object({
  platform: z.string().min(1, "平台不能为空"),
  region: z.enum(["CN", "HK", "TW", "INTL"]),
  url: z.union([z.literal(""), z.string().url("链接格式不正确")]).optional(),
  note: z.string().optional(),
  noteEn: z.string().optional(),
});

export const filmFormSchema = z.object({
  slug: z
    .string()
    .min(1, "slug 不能为空")
    .regex(/^[a-z0-9-]+$/, "仅小写字母、数字和连字符"),
  titleZh: z.string().min(1, "大陆译名不能为空"),
  titleZhHk: z.string().optional(),
  titleZhTw: z.string().optional(),
  titleOriginal: z.string().min(1, "原名不能为空"),
  titleEn: z.string().optional(),
  year: z.coerce.number<number>().int().min(1888, "早于电影诞生年").max(2100),
  /** Comma/、-separated in the form; stored as text[]. */
  countries: z.string().optional(),
  // Upper bounds on both int fields: values past int4 would otherwise
  // reach Postgres and throw 22003 past saveFilm's constraint handlers.
  runtimeMinutes: z.coerce
    .number<number>()
    .int()
    .positive()
    .max(6000, "片长超出合理范围")
    .optional()
    .or(z.literal("")),
  aspectRatio: z.string().optional(),
  isBlackAndWhite: z.boolean(),
  isSilent: z.boolean(),
  /** External ids are stored bare — never paste URLs (see lib/external-ids.ts). */
  tmdbId: z
    .string()
    .optional()
    .refine((s) => {
      if (!s) return true;
      const t = s.trim();
      return /^\d+$/.test(t) && Number(t) >= 1 && Number(t) <= 2_147_483_647;
    }, "TMDB ID 是 1–2147483647 的数字"),
  imdbId: z
    .string()
    .optional()
    .refine((s) => !s || /^tt\d{7,8}$/.test(s.trim()), "IMDb ID 形如 tt0056801"),
  doubanId: z
    .string()
    .optional()
    .refine((s) => !s || /^\d+$/.test(s.trim()), "豆瓣 ID 是纯数字（subject/ 后的部分）"),
  wikidataId: z
    .string()
    .optional()
    .refine((s) => !s || /^[Qq]\d+$/.test(s.trim()), "Wikidata ID 形如 Q550027"),
  restorationNote: z.string().optional(),
  restorationNoteEn: z.string().optional(),
  editorialNote: z
    .string()
    .optional()
    .refine(
      (s) => !s || codePointLength(s) <= EDITORIAL_NOTE_MAX,
      `编辑札记不能超过 ${EDITORIAL_NOTE_MAX} 字`,
    ),
  essay: tiptapDocSchema,
  editorialNoteEn: z
    .string()
    .optional()
    .refine(
      (s) => !s || wordCount(s) <= EDITORIAL_NOTE_EN_MAX,
      `英文札记不能超过 ${EDITORIAL_NOTE_EN_MAX} 词`,
    ),
  essayEn: tiptapDocSchema,
  cast: z.array(castMemberSchema),
  watchLinks: z.array(watchLinkSchema),
  directorIds: z
    .array(z.string())
    .refine((ids) => ids.length === new Set(ids).size, "不能重复关联同一位导演"),
  tagIds: z
    .array(z.string())
    .refine((ids) => ids.length === new Set(ids).size, "不能重复关联同一标签"),
});

export type FilmFormValues = z.infer<typeof filmFormSchema>;

/** Publishing is stricter than saving a draft. */
export function publishProblems(film: {
  editorialNote: string | null;
  directorCount: number;
}): string[] {
  const problems: string[] = [];
  // Trim first: 200 spaces used to pass the raw code-point gate while
  // rendering as nothing.
  const note = (film.editorialNote ?? "").trim();
  const len = codePointLength(note);
  if (len < EDITORIAL_NOTE_MIN || len > EDITORIAL_NOTE_MAX) {
    problems.push(`编辑札记需 ${EDITORIAL_NOTE_MIN}–${EDITORIAL_NOTE_MAX} 字（当前 ${len} 字）`);
  }
  if (film.directorCount === 0) problems.push("至少关联一位导演");
  return problems;
}

/**
 * Gate for the English edition. Content-only: an editor may publish it
 * before the zh edition — /en visibility still requires both (enforced
 * in the public query layer).
 */
export function publishEnProblems(film: {
  titleEn: string | null;
  editorialNoteEn: string | null;
}): string[] {
  const problems: string[] = [];
  if (!film.titleEn?.trim()) problems.push("缺少英文片名（titleEn）");
  const words = wordCount(film.editorialNoteEn ?? "");
  if (words < EDITORIAL_NOTE_EN_MIN || words > EDITORIAL_NOTE_EN_MAX) {
    problems.push(
      `英文札记需 ${EDITORIAL_NOTE_EN_MIN}–${EDITORIAL_NOTE_EN_MAX} 词（当前 ${words} 词）`,
    );
  }
  return problems;
}

export function parseCountries(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(/[,，、]/)
    .map((s) => s.trim())
    .filter(Boolean);
}
