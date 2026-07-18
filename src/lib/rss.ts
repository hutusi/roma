import "server-only";
import { getRecentPublishedFilms } from "@/db/queries/public";
import { type Locale, localePath } from "@/i18n/locales";
import { SITE_URL } from "@/lib/site";

/**
 * RSS 2.0 feed of the most-recently-published films, one builder for both
 * locale trees. En uses the English fields and the en-published subset
 * (getRecentPublishedFilms applies the subset rule), so /en/rss.xml never
 * lists an untranslated film or links a page that 404s there.
 */

/** The film fields the feed needs; DB rows structurally satisfy this. */
export type FeedFilm = {
  slug: string;
  titleZh: string;
  titleEn: string | null;
  titleOriginal: string;
  editorialNote: string | null;
  editorialNoteEn: string | null;
  publishedAt: Date | null;
  publishedEnAt: Date | null;
};

const CHANNEL = {
  zh: {
    title: "八部半",
    description: "经典电影策展：跨越百年的影像、导演谱系，与值得按顺序看完的片单。",
    language: "zh-CN",
  },
  en: {
    title: "Babuban",
    description:
      "Classic cinema, curated: a century of images, director lineages, and lists worth watching in order.",
    language: "en",
  },
} as const;

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function tag(name: string, value: string): string {
  return `      <${name}>${escapeXml(value)}</${name}>`;
}

/** Pure: assemble the RSS XML from already-fetched films. */
export function renderFilmsFeed(locale: Locale, films: FeedFilm[]): string {
  const en = locale === "en";
  const meta = CHANNEL[locale];
  const siteHref = `${SITE_URL}${localePath(locale, "/")}`;
  const feedHref = `${SITE_URL}${localePath(locale, "/rss.xml")}`;

  const items = films
    .map((film) => {
      const title = en ? (film.titleEn ?? film.titleOriginal) : film.titleZh;
      const link = `${SITE_URL}${localePath(locale, `/film/${film.slug}`)}`;
      const description = (en ? film.editorialNoteEn : film.editorialNote) ?? film.titleOriginal;
      const published = en ? film.publishedEnAt : film.publishedAt;
      return [
        "    <item>",
        tag("title", title),
        tag("link", link),
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        published ? `      <pubDate>${new Date(published).toUTCString()}</pubDate>` : "",
        tag("description", description),
        "    </item>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(meta.title)}</title>
    <link>${escapeXml(siteHref)}</link>
    <description>${escapeXml(meta.description)}</description>
    <language>${meta.language}</language>
    <atom:link href="${escapeXml(feedHref)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

export async function buildFilmsFeed(locale: Locale): Promise<string> {
  return renderFilmsFeed(locale, await getRecentPublishedFilms(locale, 30));
}
