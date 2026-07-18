import "server-only";
import { getSearchCorpus } from "@/db/queries/public";
import { type Locale, localePath } from "@/i18n/locales";
import { type PersonUrlRole, personPath } from "@/lib/routes";
import type { SearchDoc, SearchIndex } from "@/lib/search-match";

/**
 * Builds the per-locale search index served at /[lang]/search-index.json
 * — one builder for both locale trees, the rss.ts shape. The corpus
 * query applies the en-subset rule, so the en index can never carry a
 * zh-only entity; this module enforces the prose side: en docs carry
 * ONLY English prose, while titles/names stay bilingual in both
 * editions (titles are names — the /en film page shows the 译名 table
 * itself), which is what makes 卡萨布兰卡 findable from either edition.
 */

/** Structural rows — DB rows satisfy them, tests pass plain objects. */
export type SearchFilmRow = {
  slug: string;
  titleZh: string;
  titleZhHk: string | null;
  titleZhTw: string | null;
  titleOriginal: string;
  titleEn: string | null;
  year: number;
  editorialNote: string | null;
  editorialNoteEn: string | null;
  filmDirectors: { director: { name: string; nameZh: string | null } }[];
  cast: { name: string; nameZh: string | null }[];
  filmTags: { tag: { slug: string; nameZh: string; nameEn: string } }[];
};

export type SearchPersonRow = {
  slug: string;
  name: string;
  nameZh: string | null;
  bio: string | null;
  bioEn: string | null;
  primaryRole: PersonUrlRole;
};

export type SearchListRow = {
  slug: string;
  title: string;
  titleEn: string | null;
  theme: string | null;
  themeEn: string | null;
};

export type SearchCorpus = {
  films: SearchFilmRow[];
  people: SearchPersonRow[];
  lists: SearchListRow[];
};

const ROLE_LABEL: Record<PersonUrlRole, Record<Locale, string>> = {
  director: { zh: "导演", en: "Director" },
  actor: { zh: "演员", en: "Actor" },
};

function nameSet(...values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v && v.trim() !== ""))];
}

/** Pure: assemble docs from an already-fetched corpus. */
export function buildSearchDocs(locale: Locale, corpus: SearchCorpus): SearchDoc[] {
  const en = locale === "en";
  const docs: SearchDoc[] = [];

  for (const film of corpus.films) {
    const label = en ? (film.titleEn ?? film.titleOriginal) : film.titleZh;
    const directorsLabel = film.filmDirectors
      .map((fd) => (en ? fd.director.name : (fd.director.nameZh ?? fd.director.name)))
      .join(en ? ", " : "、");
    const sublabelParts = [
      film.titleOriginal !== label ? film.titleOriginal : null,
      String(film.year),
      directorsLabel || null,
    ].filter(Boolean);
    const prose = en ? film.editorialNoteEn : film.editorialNote;
    docs.push({
      type: "film",
      href: localePath(locale, `/film/${film.slug}`),
      label,
      sublabel: sublabelParts.length ? sublabelParts.join(" · ") : null,
      names: nameSet(
        film.titleZh,
        film.titleZhHk,
        film.titleZhTw,
        film.titleOriginal,
        film.titleEn,
        ...film.filmDirectors.flatMap((fd) => [fd.director.name, fd.director.nameZh]),
        ...film.cast.flatMap((m) => [m.name, m.nameZh]),
        ...film.filmTags.flatMap((ft) => [ft.tag.nameZh, ft.tag.nameEn]),
      ),
      ...(prose ? { prose } : {}),
      year: film.year,
    });
  }

  for (const person of corpus.people) {
    const prose = en ? person.bioEn : person.bio;
    docs.push({
      type: "person",
      // personPath picks the canonical /director vs /actor segment.
      href: localePath(locale, personPath(person)),
      label: en ? person.name : (person.nameZh ?? person.name),
      sublabel: ROLE_LABEL[person.primaryRole][locale],
      names: nameSet(person.name, person.nameZh),
      ...(prose ? { prose } : {}),
    });
  }

  for (const list of corpus.lists) {
    docs.push({
      type: "list",
      href: localePath(locale, `/list/${list.slug}`),
      // zh list title is the ADR 0012-sanctioned proper-noun fallback.
      label: en ? (list.titleEn ?? list.title) : list.title,
      sublabel: (en ? list.themeEn : list.theme) ?? null,
      names: nameSet(list.title, list.titleEn),
    });
  }

  // Tag docs derive from the fetched films, so a tag exists in this
  // index iff it is attached to ≥1 locale-visible film.
  const tagsBySlug = new Map<string, { slug: string; nameZh: string; nameEn: string }>();
  for (const film of corpus.films) {
    for (const ft of film.filmTags) tagsBySlug.set(ft.tag.slug, ft.tag);
  }
  for (const tag of [...tagsBySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug))) {
    docs.push({
      type: "tag",
      href: localePath(locale, `/films?tag=${tag.slug}`),
      label: en ? tag.nameEn : tag.nameZh,
      sublabel: null,
      names: nameSet(tag.nameZh, tag.nameEn, tag.slug),
    });
  }

  return docs;
}

export async function buildSearchIndex(locale: Locale): Promise<SearchIndex> {
  return { docs: buildSearchDocs(locale, await getSearchCorpus(locale)) };
}
