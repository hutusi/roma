import Image from "next/image";
import Link from "next/link";
import { Grain } from "@/components/site/grain";
import { TitleCard } from "@/components/site/title-card";
import { FilmCard } from "@/components/site/film-card";
import { getHomeData, posterOf } from "@/db/queries/public";

export default async function HomePage() {
  const { featured, lists, recentFilms } = await getHomeData();

  return (
    <div className="animate-fade-up">
      {/* Hero — the only surface that carries grain */}
      <section className="relative overflow-hidden border-b border-line bg-paper">
        <Grain />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <p className="font-display text-sm uppercase tracking-[0.4em] text-ink-muted">
            Babuban · 8½
          </p>
          <h1 className="text-5xl font-bold tracking-[0.25em] sm:text-6xl">
            八部半
          </h1>
          <p className="max-w-[36ch] text-lg leading-[1.9] text-ink-muted">
            一份关于经典电影的策展手册。黑白影像、导演谱系，与值得按顺序看完的片单。
          </p>
          <Link
            href="/lists"
            className="mt-4 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
          >
            浏览片单
          </Link>
        </div>
      </section>

      {featured && (
        <section className="mx-auto max-w-3xl px-6 pt-20">
          <TitleCard eyebrow="Featured List" title="本期片单" />
          <Link
            href={`/list/${featured.slug}`}
            className="group mt-8 block border border-line bg-card transition-colors hover:border-brand"
          >
            {featured.cover && (
              <div className="relative aspect-[137/60] overflow-hidden bg-ink">
                <Image
                  src={featured.cover.url}
                  alt={featured.cover.alt ?? featured.title}
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover grayscale transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            )}
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold tracking-[0.1em] transition-colors group-hover:text-brand">
                {featured.title}
              </h2>
              {featured.theme && (
                <p className="mt-2 text-sm text-ink-muted">{featured.theme}</p>
              )}
              <p className="mt-3 font-display text-xs tracking-[0.3em] text-ink-muted">
                {featured.items.length} FILMS
              </p>
            </div>
          </Link>
          {lists.length > 1 && (
            <p className="mt-4 text-center">
              <Link
                href="/lists"
                className="text-sm tracking-[0.2em] text-ink-muted transition-colors hover:text-brand"
              >
                全部片单 →
              </Link>
            </p>
          )}
        </section>
      )}

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-4">
        <TitleCard eyebrow="Recently Curated" title="近期收录" />
        {recentFilms.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {recentFilms.map((film) => {
              const poster = posterOf(film.media);
              return (
                <FilmCard
                  key={film.id}
                  slug={film.slug}
                  titleZh={film.titleZh}
                  titleOriginal={film.titleOriginal}
                  year={film.year}
                  directors={film.filmDirectors.map(
                    (fd) => fd.director.nameZh ?? fd.director.name,
                  )}
                  imageUrl={poster?.url}
                  imageAlt={poster?.alt}
                />
              );
            })}
          </div>
        ) : (
          <p className="mx-auto mt-8 max-w-2xl text-center leading-[1.9] text-ink-muted">
            首批影片正在撰写编辑札记。收录即推荐——我们不做数据库。
          </p>
        )}
      </section>
    </div>
  );
}
