import { AcademyFrame } from "@/components/site/academy-frame";
import { FilmCard } from "@/components/site/film-card";
import { LocaleSwitch } from "@/components/site/locale-switch";
import { TitleCard } from "@/components/site/title-card";
import { TiptapContent } from "@/components/tiptap/render";
import { type PublicList, posterOf } from "@/db/queries/public";
import type { Locale } from "@/i18n/locales";

/**
 * A curated list reads like an article: title card, intro essay, then
 * the films in their deliberate order, each with its reasoning. The en
 * edition keeps every zh-published member in order (顺序即立场) —
 * untranslated members render unlinked, without reasoning, rather than
 * being dropped or linking to a 404.
 */
export function ListPage({
  list,
  locale = "zh",
  actions,
}: {
  list: PublicList;
  locale?: Locale;
  actions?: React.ReactNode;
}) {
  const en = locale === "en";
  const title = en ? (list.titleEn ?? list.title) : list.title;
  const theme = en ? list.themeEn : list.theme;
  const intro = en ? list.introEn : list.intro;

  return (
    <article className="mx-auto max-w-3xl animate-fade-up px-6 pt-12">
      <TitleCard eyebrow="Curated List" title={title} />
      {theme && <p className="mt-4 text-center text-ink-muted text-sm tracking-[0.2em]">{theme}</p>}
      {list.status === "published" && (en || list.statusEn === "published") && (
        <p className="mt-3 text-center">
          <LocaleSwitch locale={locale} path={`/list/${list.slug}`} />
        </p>
      )}
      {actions && <div className="mt-6 flex justify-center">{actions}</div>}

      {list.cover && (
        <div className="mt-10">
          <AcademyFrame
            src={list.cover.url}
            alt={list.cover.alt ?? title}
            credit={list.cover.credit}
            priority
          />
        </div>
      )}

      {intro && <TiptapContent doc={intro} className="mx-auto mt-10 max-w-[70ch]" />}

      <ol className="mt-14 space-y-12 pb-4">
        {list.items.map((item, index) => {
          const poster = posterOf(item.film.media);
          const enVisible = item.film.statusEn === "published";
          const filmTitle = en ? (item.film.titleEn ?? item.film.titleOriginal) : item.film.titleZh;
          const subtitle = item.film.titleOriginal !== filmTitle ? item.film.titleOriginal : null;
          const reasoning = en ? item.reasoningEn : item.reasoning;
          return (
            <li key={item.id}>
              <div className="mb-4 flex items-baseline gap-3">
                <span className="font-display text-3xl text-ink-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-line" />
              </div>
              {en && !enVisible ? (
                <div className="flex items-baseline justify-between border border-line bg-card p-4">
                  <span className="font-bold text-ink-muted">
                    {filmTitle}
                    {subtitle && (
                      <span className="ml-2 font-display font-normal text-sm">{subtitle}</span>
                    )}
                  </span>
                  <span className="font-display text-ink-muted text-sm">{item.film.year}</span>
                </div>
              ) : (
                <>
                  <FilmCard
                    href={en ? `/en/film/${item.film.slug}` : `/film/${item.film.slug}`}
                    title={filmTitle}
                    subtitle={subtitle}
                    year={item.film.year}
                    directorsLabel={item.film.filmDirectors
                      .map((fd) =>
                        en ? fd.director.name : (fd.director.nameZh ?? fd.director.name),
                      )
                      .join(en ? ", " : "、")}
                    imageUrl={poster?.url}
                    imageAlt={poster?.alt}
                  />
                  {reasoning && <TiptapContent doc={reasoning} className="mt-4 pl-2 text-[16px]" />}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </article>
  );
}
