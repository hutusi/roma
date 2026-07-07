"use server";

import { requireEditor } from "@/lib/auth-guards";
import { type ActionResult, fail, ok } from "./result";

/**
 * Prefills the film form from TMDB — metadata only, editors curate and
 * correct. Never imports images (licensing). Gated on TMDB_API_TOKEN.
 * TMDB attribution lives on /about.
 */
export type TmdbPrefill = {
  titleZh?: string;
  titleZhHk?: string;
  titleZhTw?: string;
  titleOriginal: string;
  titleEn?: string;
  year?: number;
  runtimeMinutes?: number;
  countries: string;
  cast: { name: string; character?: string }[];
};

const TMDB = "https://api.themoviedb.org/3";

export async function importFromTmdb(tmdbId: string): Promise<ActionResult<TmdbPrefill>> {
  await requireEditor();
  const token = process.env.TMDB_API_TOKEN;
  if (!token) return fail("未配置 TMDB_API_TOKEN");
  if (!/^\d+$/.test(tmdbId.trim())) return fail("请输入 TMDB 数字 ID");

  const get = async (path: string) => {
    const res = await fetch(`${TMDB}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`TMDB ${res.status}`);
    return res.json();
  };

  try {
    const id = tmdbId.trim();
    const [movie, translations, credits] = await Promise.all([
      get(`/movie/${id}?language=zh-CN`),
      get(`/movie/${id}/translations`),
      get(`/movie/${id}/credits?language=zh-CN`),
    ]);

    const findTitle = (iso3166: string, iso639 = "zh") =>
      (
        translations.translations as {
          iso_3166_1: string;
          iso_639_1: string;
          data: { title?: string };
        }[]
      ).find((t) => t.iso_3166_1 === iso3166 && t.iso_639_1 === iso639)?.data.title || undefined;

    return ok({
      titleZh: movie.title !== movie.original_title ? movie.title : findTitle("CN"),
      titleZhHk: findTitle("HK"),
      titleZhTw: findTitle("TW"),
      titleOriginal: movie.original_title,
      titleEn: findTitle("US", "en"),
      year: movie.release_date ? Number(movie.release_date.slice(0, 4)) : undefined,
      runtimeMinutes: movie.runtime || undefined,
      countries:
        (movie.production_countries as { name: string }[] | undefined)
          ?.map((c) => c.name)
          .join("、") ?? "",
      cast:
        (credits.cast as { name: string; character?: string }[] | undefined)
          ?.slice(0, 8)
          .map((m) => ({ name: m.name, character: m.character || undefined })) ?? [],
    });
  } catch (error) {
    return fail(
      error instanceof Error && error.message.includes("404")
        ? "TMDB 上没有这个 ID"
        : "TMDB 请求失败，请稍后再试",
    );
  }
}
