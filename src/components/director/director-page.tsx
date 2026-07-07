import Link from "next/link";
import { AcademyFrame } from "@/components/site/academy-frame";
import { TitleCard } from "@/components/site/title-card";
import { TiptapContent } from "@/components/tiptap/render";
import { FilmCard } from "@/components/site/film-card";
import { posterOf, type PublicDirector } from "@/db/queries/public";

export function DirectorPage({ director }: { director: PublicDirector }) {
  const portrait =
    director.media.find((m) => m.kind === "portrait") ?? director.media[0] ?? null;

  return (
    <article className="mx-auto max-w-3xl animate-fade-up px-6 pt-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold tracking-[0.15em]">
          {director.nameZh ?? director.name}
        </h1>
        <p className="mt-3 font-display text-lg text-ink-muted">{director.name}</p>
      </header>

      {portrait && (
        <div className="mx-auto mt-10 max-w-md">
          <AcademyFrame
            src={portrait.url}
            alt={portrait.alt ?? director.name}
            credit={portrait.credit}
          />
        </div>
      )}

      {director.bio && (
        <p className="mx-auto mt-10 max-w-[70ch] text-[17px] leading-[1.9] tracking-[0.02em] text-ink-muted">
          {director.bio}
        </p>
      )}

      {director.careerEssay && (
        <section className="mt-14">
          <TitleCard eyebrow="Career" title="创作历程" />
          <TiptapContent
            doc={director.careerEssay}
            className="mx-auto mt-8 max-w-[70ch]"
          />
        </section>
      )}

      {director.viewingItems.length > 0 && (
        <section className="mt-14">
          <TitleCard eyebrow="Suggested Order" title="建议观看顺序" />
          <ol className="mx-auto mt-8 max-w-xl space-y-6">
            {director.viewingItems.map((item, index) => (
              <li key={item.id} className="flex gap-4">
                <span className="font-display text-2xl text-ink-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 border-b border-line pb-5">
                  {item.film.status === "published" ? (
                    <Link
                      href={`/film/${item.film.slug}`}
                      className="font-bold hover:text-brand"
                    >
                      {item.film.titleZh}
                      <span className="ml-2 font-display text-sm font-normal text-ink-muted">
                        {item.film.year}
                      </span>
                    </Link>
                  ) : (
                    <span className="font-bold">{item.film.titleZh}</span>
                  )}
                  {item.note && (
                    <p className="mt-1.5 text-[15px] leading-[1.8] text-ink-muted">
                      {item.note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {director.films.length > 0 && (
        <section className="mt-14 pb-4">
          <TitleCard eyebrow="Films" title="收录影片" />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {director.films.map((film) => {
              const poster = posterOf(film.media);
              return (
                <FilmCard
                  key={film.id}
                  slug={film.slug}
                  titleZh={film.titleZh}
                  titleOriginal={film.titleOriginal}
                  year={film.year}
                  directors={[]}
                  imageUrl={poster?.url}
                  imageAlt={poster?.alt}
                />
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
}
