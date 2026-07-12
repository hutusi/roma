import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FilmCard } from "@/components/site/film-card";
import { Grain } from "@/components/site/grain";
import { TitleCard } from "@/components/site/title-card";
import { getHomeData, posterOf } from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";
import { localePath } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";

export const metadata: Metadata = {
  alternates: { languages: languageAlternates("/", { en: true }) },
};

// Page-local copy stays with the page (dictionaries are for shared
// chrome only); zh and en literals sit side by side so a missing key
// is a type error at the use site.
const COPY = {
  zh: {
    tagline: "一份关于经典电影的策展手册。黑白影像、导演谱系，与值得按顺序看完的片单。",
    taglineWidth: "max-w-[36ch]",
    browseCta: "浏览片单",
    featuredEyebrow: "Featured List",
    featuredTitle: "本期片单",
    allListsCta: "全部片单 →",
    recentEyebrow: "Recently Curated",
    recentTitle: "近期收录",
    emptyNote: "首批影片正在撰写编辑札记。收录即推荐——我们不做数据库。",
  },
  en: {
    tagline:
      "A curatorial handbook for classic cinema. Black-and-white images, director lineages, and lists worth watching in order.",
    taglineWidth: "max-w-[40ch]",
    browseCta: "Browse the lists",
    featuredEyebrow: undefined,
    featuredTitle: "Featured List",
    allListsCta: "All lists →",
    recentEyebrow: undefined,
    recentTitle: "Recently Curated",
    emptyNote:
      "The first English editions are being written. Inclusion is the recommendation — this is not a database.",
  },
} as const;

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = parseLocale((await params).lang);
  const en = locale === "en";
  const t = COPY[locale];
  const { featured, lists, recentFilms } = await getHomeData(locale);

  const featuredTitle = featured
    ? en
      ? (featured.titleEn ?? featured.title)
      : featured.title
    : "";
  const featuredTheme = featured ? (en ? featured.themeEn : featured.theme) : null;

  return (
    <div className="animate-fade-up">
      {/* Hero — the only surface that carries grain */}
      <section className="relative overflow-hidden border-line border-b bg-paper">
        <Grain />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <p className="font-display text-ink-muted text-sm uppercase tracking-[0.4em]">
            Babuban · 8½
          </p>
          <h1 className="font-bold text-5xl tracking-[0.25em] sm:text-6xl">八部半</h1>
          <p className={`${t.taglineWidth} text-ink-muted text-lg leading-[1.9]`}>{t.tagline}</p>
          <Link
            href={localePath(locale, "/lists")}
            className="mt-4 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
          >
            {t.browseCta}
          </Link>
        </div>
      </section>

      {featured && (
        <section className="mx-auto max-w-3xl px-6 pt-20">
          <TitleCard eyebrow={t.featuredEyebrow} title={t.featuredTitle} />
          <Link
            href={localePath(locale, `/list/${featured.slug}`)}
            className="group mt-8 block border border-line bg-card transition-colors hover:border-brand"
          >
            {featured.cover && (
              <div className="relative aspect-[137/60] overflow-hidden bg-ink">
                <Image
                  src={featured.cover.url}
                  alt={featured.cover.alt ?? featuredTitle}
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover grayscale transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            )}
            <div className="p-6 text-center">
              <h2 className="font-bold text-xl tracking-[0.1em] transition-colors group-hover:text-brand">
                {featuredTitle}
              </h2>
              {featuredTheme && <p className="mt-2 text-ink-muted text-sm">{featuredTheme}</p>}
              <p className="mt-3 font-display text-ink-muted text-xs tracking-[0.3em]">
                {featured.items.length} FILMS
              </p>
            </div>
          </Link>
          {lists.length > 1 && (
            <p className="mt-4 text-center">
              <Link
                href={localePath(locale, "/lists")}
                className="text-ink-muted text-sm tracking-[0.2em] transition-colors hover:text-brand"
              >
                {t.allListsCta}
              </Link>
            </p>
          )}
        </section>
      )}

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-4">
        <TitleCard eyebrow={t.recentEyebrow} title={t.recentTitle} />
        {recentFilms.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {recentFilms.map((film) => {
              const poster = posterOf(film.media);
              const title = en ? (film.titleEn ?? film.titleOriginal) : film.titleZh;
              return (
                <FilmCard
                  key={film.id}
                  href={localePath(locale, `/film/${film.slug}`)}
                  title={title}
                  subtitle={film.titleOriginal !== title ? film.titleOriginal : null}
                  year={film.year}
                  directorsLabel={film.filmDirectors
                    .map((fd) => (en ? fd.director.name : (fd.director.nameZh ?? fd.director.name)))
                    .join(en ? ", " : "、")}
                  imageUrl={poster?.url}
                  imageAlt={poster?.alt}
                />
              );
            })}
          </div>
        ) : (
          <p className="mx-auto mt-8 max-w-2xl text-center text-ink-muted leading-[1.9]">
            {t.emptyNote}
          </p>
        )}
      </section>
    </div>
  );
}
