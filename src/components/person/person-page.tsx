import Link from "next/link";
import { AcademyFrame } from "@/components/site/academy-frame";
import { FilmCard } from "@/components/site/film-card";
import { LocaleSwitch } from "@/components/site/locale-switch";
import { TitleCard } from "@/components/site/title-card";
import { TiptapContent } from "@/components/tiptap/render";
import { type PublicPerson, posterOf } from "@/db/queries/public";
import { getDict } from "@/i18n/dict";
import { type Locale, localePath } from "@/i18n/locales";

/**
 * Pure presentation of a person for both locales; the en edition
 * shows English prose only, and the query layer has already filtered
 * films/viewing items to the locale's visible subset.
 */
export function PersonPage({ person, locale = "zh" }: { person: PublicPerson; locale?: Locale }) {
  const dict = getDict(locale).person;
  const en = locale === "en";
  const portrait = person.media.find((m) => m.kind === "portrait") ?? person.media[0] ?? null;
  const displayName = en ? person.name : (person.nameZh ?? person.name);
  const subName = en ? person.nameZh : person.name;
  const bio = en ? person.bioEn : person.bio;
  const careerEssay = en ? person.careerEssayEn : person.careerEssay;

  return (
    <article className="mx-auto max-w-3xl animate-fade-up px-6 pt-12">
      <header className="text-center">
        <h1 className="font-bold text-4xl tracking-[0.15em]">{displayName}</h1>
        {subName && subName !== displayName && (
          <p className="mt-3 font-display text-ink-muted text-lg">{subName}</p>
        )}
        {person.status === "published" && (
          <p className="mt-3">
            <LocaleSwitch locale={locale} path={`/director/${person.slug}`} />
          </p>
        )}
      </header>

      {portrait && (
        <div className="mx-auto mt-10 max-w-md">
          <AcademyFrame
            src={portrait.url}
            alt={portrait.alt ?? person.name}
            credit={portrait.credit}
            locale={locale}
          />
        </div>
      )}

      {bio && (
        <p className="mx-auto mt-10 max-w-[70ch] text-[17px] text-ink-muted leading-[1.9] tracking-[0.02em]">
          {bio}
        </p>
      )}

      {careerEssay && (
        <section className="mt-14">
          <TitleCard eyebrow={en ? undefined : "Career"} title={dict.career} />
          <TiptapContent doc={careerEssay} className="mx-auto mt-8 max-w-[70ch]" />
        </section>
      )}

      {person.viewingItems.length > 0 && (
        <section className="mt-14">
          <TitleCard eyebrow={en ? undefined : "Suggested Order"} title={dict.suggestedOrder} />
          <ol className="mx-auto mt-8 max-w-xl space-y-6">
            {person.viewingItems.map((item, index) => {
              const filmTitle = en
                ? (item.film.titleEn ?? item.film.titleOriginal)
                : item.film.titleZh;
              const note = en ? item.noteEn : item.note;
              return (
                <li key={item.id} className="flex gap-4">
                  <span className="font-display text-2xl text-ink-muted">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 border-line border-b pb-5">
                    {item.film.status === "published" ? (
                      <Link
                        href={localePath(locale, `/film/${item.film.slug}`)}
                        className="font-bold hover:text-brand"
                      >
                        {filmTitle}
                        <span className="ml-2 font-display font-normal text-ink-muted text-sm">
                          {item.film.year}
                        </span>
                      </Link>
                    ) : (
                      <span className="font-bold">{filmTitle}</span>
                    )}
                    {note && (
                      <p className="mt-1.5 text-[15px] text-ink-muted leading-[1.8]">{note}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {person.films.length > 0 && (
        <section className="mt-14 pb-4">
          <TitleCard eyebrow={en ? undefined : "Films"} title={dict.films} />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {person.films.map((film) => {
              const poster = posterOf(film.media);
              const title = en ? (film.titleEn ?? film.titleOriginal) : film.titleZh;
              const subtitle = film.titleOriginal !== title ? film.titleOriginal : null;
              return (
                <FilmCard
                  key={film.id}
                  href={localePath(locale, `/film/${film.slug}`)}
                  title={title}
                  subtitle={subtitle}
                  year={film.year}
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
