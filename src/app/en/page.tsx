import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FilmCard } from "@/components/site/film-card";
import { Grain } from "@/components/site/grain";
import { TitleCard } from "@/components/site/title-card";
import { getHomeData, posterOf } from "@/db/queries/public";
import { languageAlternates } from "@/i18n/alternates";

/**
 * English home — same shape as the zh home, over the en-published
 * subset. Sections render only when the subset has content, so the
 * page degrades gracefully while translations roll out.
 */
export const metadata: Metadata = {
  alternates: { languages: languageAlternates("/", { en: true }) },
};

export default async function EnHomePage() {
  const { featured, lists, recentFilms } = await getHomeData("en");

  return (
    <div className="animate-fade-up">
      <section className="relative overflow-hidden border-line border-b bg-paper">
        <Grain />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <p className="font-display text-ink-muted text-sm uppercase tracking-[0.4em]">
            Babuban · 8½
          </p>
          <h1 className="font-bold text-5xl tracking-[0.25em] sm:text-6xl">八部半</h1>
          <p className="max-w-[40ch] text-ink-muted text-lg leading-[1.9]">
            A curatorial handbook for classic cinema. Black-and-white images, director lineages, and
            lists worth watching in order.
          </p>
          <Link
            href="/en/lists"
            className="mt-4 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
          >
            Browse the lists
          </Link>
        </div>
      </section>

      {featured && (
        <section className="mx-auto max-w-3xl px-6 pt-20">
          <TitleCard title="Featured List" />
          <Link
            href={`/en/list/${featured.slug}`}
            className="group mt-8 block border border-line bg-card transition-colors hover:border-brand"
          >
            {featured.cover && (
              <div className="relative aspect-[137/60] overflow-hidden bg-ink">
                <Image
                  src={featured.cover.url}
                  alt={featured.cover.alt ?? featured.titleEn ?? featured.title}
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover grayscale transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            )}
            <div className="p-6 text-center">
              <h2 className="font-bold text-xl tracking-[0.1em] transition-colors group-hover:text-brand">
                {featured.titleEn ?? featured.title}
              </h2>
              {featured.themeEn && (
                <p className="mt-2 text-ink-muted text-sm">{featured.themeEn}</p>
              )}
              <p className="mt-3 font-display text-ink-muted text-xs tracking-[0.3em]">
                {featured.items.length} FILMS
              </p>
            </div>
          </Link>
          {lists.length > 1 && (
            <p className="mt-4 text-center">
              <Link
                href="/en/lists"
                className="text-ink-muted text-sm tracking-[0.2em] transition-colors hover:text-brand"
              >
                All lists →
              </Link>
            </p>
          )}
        </section>
      )}

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-4">
        <TitleCard title="Recently Curated" />
        {recentFilms.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {recentFilms.map((film) => {
              const poster = posterOf(film.media);
              const title = film.titleEn ?? film.titleOriginal;
              return (
                <FilmCard
                  key={film.id}
                  href={`/en/film/${film.slug}`}
                  title={title}
                  subtitle={film.titleOriginal !== title ? film.titleOriginal : null}
                  year={film.year}
                  directorsLabel={film.filmDirectors.map((fd) => fd.director.name).join(", ")}
                  imageUrl={poster?.url}
                  imageAlt={poster?.alt}
                />
              );
            })}
          </div>
        ) : (
          <p className="mx-auto mt-8 max-w-2xl text-center text-ink-muted leading-[1.9]">
            The first English editions are being written. Inclusion is the recommendation — this is
            not a database.
          </p>
        )}
      </section>
    </div>
  );
}
