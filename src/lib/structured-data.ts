import "server-only";
import type { PublicFilm, PublicList, PublicPerson } from "@/db/queries/public";
import { visibleIn } from "@/db/queries/visibility";
import { countryToEn } from "@/i18n/countries";
import { HTML_LANG, type Locale, localePath } from "@/i18n/locales";
import { personPath } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

/**
 * Schema.org JSON-LD builders for the editorial detail pages. These emit
 * a data block for crawlers (Movie / Person / ItemList + BreadcrumbList),
 * not rendered prose — the en variants pick the English fields and only
 * link to entities that are en-visible (the same subset rule the pages
 * apply), so /en never points a crawler at a page that 404s there.
 *
 * Rendered via <JsonLd>, which serializes with serializeJsonLd below.
 */

type JsonLdNode = Record<string, unknown>;

const CRUMB = {
  zh: { home: "首页", films: "影片", lists: "片单" },
  en: { home: "Home", films: "Films", lists: "Curated Lists" },
} as const;

const JOB_TITLE = {
  director: { zh: "电影导演", en: "Film director" },
  actor: { zh: "演员", en: "Actor" },
} as const;

function abs(locale: Locale, path: string): string {
  return `${SITE_URL}${localePath(locale, path)}`;
}

/** Blob URLs are absolute; local-dev paths aren't — make image URLs absolute either way. */
function absImage(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

/** poster → still → hero → portrait → first, mirroring the page's own priority. */
function pickImage(media: { kind: string; url: string }[]): string | undefined {
  const byKind = (k: string) => media.find((m) => m.kind === k)?.url;
  return absImage(
    byKind("poster") ?? byKind("still") ?? byKind("hero") ?? byKind("portrait") ?? media[0]?.url,
  );
}

function breadcrumb(locale: Locale, trail: { name: string; path: string }[]): JsonLdNode {
  return {
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: abs(locale, t.path),
    })),
  };
}

function graph(nodes: JsonLdNode[]): JsonLdNode {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/**
 * Site-level identity for the home pages. The WebSite node is per-locale
 * (each locale home is its own page with its own name/inLanguage); the
 * Organization is one entity shared by both, so it keeps a single @id
 * and carries the other-language name as alternateName. The
 * SearchAction targets the locale's own /search page (client-side
 * matching over the static index). The logo path is the generated
 * brand icon.
 */
export function websiteJsonLd(locale: Locale): JsonLdNode {
  const en = locale === "en";
  const orgId = `${SITE_URL}/#org`;
  return graph([
    {
      "@type": "WebSite",
      "@id": `${abs(locale, "/")}#website`,
      name: en ? "Babuban" : "八部半",
      alternateName: en ? ["八部半", "8½"] : ["Babuban", "8½"],
      url: abs(locale, "/"),
      inLanguage: HTML_LANG[locale],
      publisher: { "@id": orgId },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${abs(locale, "/search")}?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": orgId,
      name: "八部半",
      alternateName: ["Babuban", "8½"],
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512.png`,
    },
  ]);
}

export function filmJsonLd(film: PublicFilm, locale: Locale = "zh"): JsonLdNode {
  const en = locale === "en";
  const url = abs(locale, `/film/${film.slug}`);
  const name = en ? (film.titleEn ?? film.titleOriginal) : film.titleZh;
  const crumb = CRUMB[locale];

  const director = film.filmDirectors.map((fd) => {
    const linked =
      fd.director.status === "published" && (!en || fd.director.statusEn === "published");
    const person: JsonLdNode = {
      "@type": "Person",
      name: en ? fd.director.name : (fd.director.nameZh ?? fd.director.name),
    };
    if (linked) person.url = abs(locale, personPath(fd.director));
    return person;
  });

  // Unlinked credits still emit a name-only Person; linked ones get a
  // url only when the person is visible in this locale (strict gate,
  // same as director Persons above).
  const actor = film.cast.map((member) => {
    const person: JsonLdNode = {
      "@type": "Person",
      name: en ? member.name : (member.nameZh ?? member.name),
    };
    if (member.person && visibleIn(member.person, locale)) {
      person.url = abs(locale, personPath(member.person));
    }
    return person;
  });

  const alternateName = [...new Set([film.titleOriginal, en ? film.titleZh : film.titleEn])].filter(
    (t): t is string => !!t && t !== name,
  );
  const description = (en ? film.editorialNoteEn : film.editorialNote)?.slice(0, 300);
  const image = pickImage(film.media);

  const movie: JsonLdNode = {
    "@type": "Movie",
    "@id": `${url}#movie`,
    name,
    url,
    dateCreated: String(film.year),
    ...(alternateName.length ? { alternateName } : {}),
    ...(description ? { description } : {}),
    ...(director.length ? { director } : {}),
    ...(actor.length ? { actor } : {}),
    ...(film.countries.length
      ? {
          countryOfOrigin: film.countries.map((c) => ({
            "@type": "Country",
            name: en ? countryToEn(c) : c,
          })),
        }
      : {}),
    ...(film.runtimeMinutes ? { duration: `PT${film.runtimeMinutes}M` } : {}),
    ...(film.filmTags.length
      ? { genre: film.filmTags.map((ft) => (en ? ft.tag.nameEn : ft.tag.nameZh)) }
      : {}),
    ...(image ? { image } : {}),
  };

  return graph([
    movie,
    breadcrumb(locale, [
      { name: crumb.home, path: "/" },
      { name: crumb.films, path: "/films" },
      { name, path: `/film/${film.slug}` },
    ]),
  ]);
}

export function personJsonLd(person: PublicPerson, locale: Locale = "zh"): JsonLdNode {
  const en = locale === "en";
  const url = abs(locale, personPath(person));
  const displayName = en ? person.name : (person.nameZh ?? person.name);
  const subName = en ? person.nameZh : person.name;
  const description = (en ? person.bioEn : person.bio)?.slice(0, 300);
  const image = pickImage(person.media);
  const crumb = CRUMB[locale];

  const personNode: JsonLdNode = {
    "@type": "Person",
    "@id": `${url}#person`,
    name: displayName,
    url,
    jobTitle: JOB_TITLE[person.primaryRole][locale],
    ...(subName && subName !== displayName ? { alternateName: subName } : {}),
    ...(description ? { description } : {}),
    ...(image ? { image } : {}),
  };

  return graph([
    personNode,
    breadcrumb(locale, [
      { name: crumb.home, path: "/" },
      { name: displayName, path: personPath(person) },
    ]),
  ]);
}

export function listJsonLd(list: PublicList, locale: Locale = "zh"): JsonLdNode {
  const en = locale === "en";
  const url = abs(locale, `/list/${list.slug}`);
  const name = en ? (list.titleEn ?? list.title) : list.title;
  const description = en ? list.themeEn : list.theme;
  const crumb = CRUMB[locale];

  const itemListElement = list.items.map((item, i) => {
    const f = item.film;
    const element: JsonLdNode = {
      "@type": "ListItem",
      position: i + 1,
      name: en ? (f.titleEn ?? f.titleOriginal) : f.titleZh,
    };
    // Only link members visible in this locale: 顺序即立场 keeps untranslated
    // members in the ordering, but /en must not link one (it 404s there).
    if (visibleIn(f, locale)) element.item = abs(locale, `/film/${f.slug}`);
    return element;
  });

  const itemList: JsonLdNode = {
    "@type": "ItemList",
    "@id": `${url}#itemlist`,
    name,
    url,
    ...(description ? { description } : {}),
    numberOfItems: list.items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement,
  };

  return graph([
    itemList,
    breadcrumb(locale, [
      { name: crumb.home, path: "/" },
      { name: crumb.lists, path: "/lists" },
      { name, path: `/list/${list.slug}` },
    ]),
  ]);
}

// JS line/paragraph separators: legal inside a JSON string but not inside
// HTML <script> text, so they must be escaped in the serialized output.
const LINE_SEP = String.fromCharCode(0x2028);
const PARA_SEP = String.fromCharCode(0x2029);

/**
 * Serialize a JSON-LD node for injection into a <script> element. Escapes
 * "<" so a string value containing "</script>" can't break out of the
 * element, plus U+2028/U+2029. This keeps the raw injection in <JsonLd>
 * safe regardless of what an editor typed into a title or note.
 */
export function serializeJsonLd(node: JsonLdNode): string {
  return JSON.stringify(node)
    .replaceAll("<", "\\u003c")
    .replaceAll(LINE_SEP, "\\u2028")
    .replaceAll(PARA_SEP, "\\u2029");
}
