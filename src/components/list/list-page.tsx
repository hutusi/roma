import { AcademyFrame } from "@/components/site/academy-frame";
import { FilmCard } from "@/components/site/film-card";
import { TitleCard } from "@/components/site/title-card";
import { TiptapContent } from "@/components/tiptap/render";
import { posterOf, type PublicList } from "@/db/queries/public";

/**
 * A curated list reads like an article: title card, intro essay, then
 * the films in their deliberate order, each with its reasoning.
 */
export function ListPage({
  list,
  actions,
}: {
  list: PublicList;
  actions?: React.ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl animate-fade-up px-6 pt-12">
      <TitleCard eyebrow="Curated List" title={list.title} />
      {list.theme && (
        <p className="mt-4 text-center text-sm tracking-[0.2em] text-ink-muted">
          {list.theme}
        </p>
      )}
      {actions && <div className="mt-6 flex justify-center">{actions}</div>}

      {list.cover && (
        <div className="mt-10">
          <AcademyFrame
            src={list.cover.url}
            alt={list.cover.alt ?? list.title}
            credit={list.cover.credit}
            priority
          />
        </div>
      )}

      {list.intro && (
        <TiptapContent doc={list.intro} className="mx-auto mt-10 max-w-[70ch]" />
      )}

      <ol className="mt-14 space-y-12 pb-4">
        {list.items.map((item, index) => {
          const poster = posterOf(item.film.media);
          return (
            <li key={item.id}>
              <div className="mb-4 flex items-baseline gap-3">
                <span className="font-display text-3xl text-ink-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
              <FilmCard
                slug={item.film.slug}
                titleZh={item.film.titleZh}
                titleOriginal={item.film.titleOriginal}
                year={item.film.year}
                directors={item.film.filmDirectors.map(
                  (fd) => fd.director.nameZh ?? fd.director.name,
                )}
                imageUrl={poster?.url}
                imageAlt={poster?.alt}
              />
              {item.reasoning && (
                <TiptapContent
                  doc={item.reasoning}
                  className="mt-4 pl-2 text-[16px]"
                />
              )}
            </li>
          );
        })}
      </ol>
    </article>
  );
}
