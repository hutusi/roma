import Link from "next/link";
import { AcademyFrame } from "@/components/site/academy-frame";
import { LocaleSwitch } from "@/components/site/locale-switch";
import { TitleCard } from "@/components/site/title-card";
import { TiptapContent } from "@/components/tiptap/render";
import { heroOf, type PublicFilm } from "@/db/queries/public";
import { countryToEn } from "@/i18n/countries";
import { getDict } from "@/i18n/dict";
import { type Locale, localePath } from "@/i18n/locales";

/** Latin eyebrows are locale-neutral; zh pairs them with a zh title, en drops them. */
const EYEBROWS = {
  editorialNote: "Editorial Note",
  titles: "Titles",
  cast: "Cast",
  watch: "Where to Watch",
  relatedLists: "Curated Lists",
};

/**
 * Pure presentation of a film — consumed by the public /film/[slug]
 * page (published only), its /en counterpart, and the editor-gated
 * draft preview, so all always look identical. The en edition shows
 * only English prose (no zh fallback) and only links to directors and
 * lists that are themselves en-visible.
 */
export function FilmPage({
  film,
  locale = "zh",
  actions,
}: {
  film: PublicFilm;
  locale?: Locale;
  actions?: React.ReactNode;
}) {
  const dict = getDict(locale).film;
  const en = locale === "en";
  const eyebrow = (key: keyof typeof EYEBROWS) => (en ? undefined : EYEBROWS[key]);

  const hero = heroOf(film.media);
  const displayTitle = en ? (film.titleEn ?? film.titleOriginal) : film.titleZh;
  const subtitle = film.titleOriginal !== displayTitle ? film.titleOriginal : null;
  const editorialNote = en ? film.editorialNoteEn : film.editorialNote;
  const essay = en ? film.essayEn : film.essay;

  const directorNames = film.filmDirectors.map((fd) => ({
    slug: fd.director.slug,
    label: en ? fd.director.name : (fd.director.nameZh ?? fd.director.name),
    linked: fd.director.status === "published",
  }));

  const facts = [
    String(film.year),
    ...film.countries.map((c) => (en ? countryToEn(c) : c)),
    film.runtimeMinutes ? dict.runtime(film.runtimeMinutes) : null,
    film.aspectRatio,
    film.isBlackAndWhite ? dict.blackAndWhite : dict.color,
  ].filter(Boolean);

  const translations = [
    { label: dict.titleLabels.mainland, value: film.titleZh },
    { label: dict.titleLabels.hongkong, value: film.titleZhHk },
    { label: dict.titleLabels.taiwan, value: film.titleZhTw },
    { label: dict.titleLabels.english, value: film.titleEn },
  ].filter((t) => t.value);

  const watchByRegion = Object.entries(
    film.watchLinks.reduce<Record<string, typeof film.watchLinks>>((acc, link) => {
      acc[link.region] ??= [];
      acc[link.region].push(link);
      return acc;
    }, {}),
  );

  return (
    <article className="mx-auto max-w-3xl animate-fade-up px-6 pt-12">
      {hero && (
        <AcademyFrame
          src={hero.url}
          alt={hero.alt ?? displayTitle}
          credit={hero.credit}
          locale={locale}
          priority
        />
      )}

      <header className="mt-10 text-center">
        <h1 className="font-bold text-4xl tracking-[0.15em]">{displayTitle}</h1>
        {subtitle && <p className="mt-3 font-display text-ink-muted text-lg">{subtitle}</p>}
        <p className="mt-4 text-ink-muted text-sm tracking-[0.2em]">{facts.join(" · ")}</p>
        {directorNames.length > 0 && (
          <p className="mt-2 text-ink-muted text-sm">
            {dict.directedBy}
            {directorNames.map((d, i) => (
              <span key={d.slug}>
                {i > 0 && dict.nameSeparator}
                {d.linked ? (
                  <Link
                    href={localePath(locale, `/director/${d.slug}`)}
                    className="text-brand hover:underline"
                  >
                    {d.label}
                  </Link>
                ) : (
                  d.label
                )}
              </span>
            ))}
          </p>
        )}
        {film.status === "published" && (
          <p className="mt-3">
            <LocaleSwitch locale={locale} path={`/film/${film.slug}`} />
          </p>
        )}
        {actions && <div className="mt-5 flex justify-center">{actions}</div>}
      </header>

      {editorialNote && (
        <section className="mt-14">
          <TitleCard eyebrow={eyebrow("editorialNote")} title={dict.editorialNote} />
          <p className="mx-auto mt-8 max-w-[70ch] text-[17px] leading-[1.9] tracking-[0.02em]">
            {editorialNote}
          </p>
        </section>
      )}

      {essay && (
        <section className="mt-14">
          <TiptapContent doc={essay} className="mx-auto max-w-[70ch]" />
        </section>
      )}

      {translations.length > 1 && (
        <section className="mt-14">
          <TitleCard eyebrow={eyebrow("titles")} title={dict.titles} />
          <dl className="mx-auto mt-8 max-w-md">
            {translations.map((t) => (
              <div
                key={t.label}
                className="flex justify-between border-line border-b py-2.5 text-[15px]"
              >
                <dt className="text-ink-muted">{t.label}</dt>
                <dd>{t.value}</dd>
              </div>
            ))}
            <div className="flex justify-between py-2.5 text-[15px]">
              <dt className="text-ink-muted">{dict.titleLabels.original}</dt>
              <dd className="font-display">{film.titleOriginal}</dd>
            </div>
          </dl>
        </section>
      )}

      {film.cast.length > 0 && (
        <section className="mt-14">
          <TitleCard eyebrow={eyebrow("cast")} title={dict.cast} />
          <ul className="mx-auto mt-8 max-w-md space-y-2 text-[15px]">
            {film.cast.slice(0, 10).map((member) => (
              <li key={member.id} className="flex justify-between border-line border-b py-1.5">
                <span>
                  {en ? member.name : (member.nameZh ?? member.name)}
                  {!en && member.nameZh && (
                    <span className="ml-2 font-display text-ink-muted text-sm">{member.name}</span>
                  )}
                </span>
                {member.character && (
                  <span className="text-ink-muted">{dict.castAs(member.character)}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {watchByRegion.length > 0 && (
        <section className="mt-14">
          <TitleCard eyebrow={eyebrow("watch")} title={dict.watch} />
          <div className="mx-auto mt-8 max-w-md space-y-4">
            {watchByRegion.map(([region, links]) => (
              <div key={region}>
                <p className="text-ink-muted text-sm tracking-[0.2em]">
                  {dict.regions[region as keyof typeof dict.regions] ?? region}
                </p>
                <ul className="mt-1 space-y-1">
                  {links.map((link) => {
                    const note = en ? link.noteEn : link.note;
                    return (
                      <li
                        key={link.id}
                        className="flex justify-between border-line border-b py-1.5 text-[15px]"
                      >
                        {link.url ? (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand hover:underline"
                          >
                            {link.platform}
                          </a>
                        ) : (
                          <span>{link.platform}</span>
                        )}
                        {note && <span className="text-ink-muted">{note}</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-3 max-w-md text-ink-muted text-xs">{dict.watchDisclaimer}</p>
        </section>
      )}

      {film.relatedLists.length > 0 && (
        <section className="mt-14 pb-4">
          <TitleCard eyebrow={eyebrow("relatedLists")} title={dict.relatedLists} />
          <ul className="mx-auto mt-8 max-w-md space-y-2">
            {film.relatedLists.map((list) => {
              const listTitle = en ? (list.titleEn ?? list.title) : list.title;
              const listTheme = en ? list.themeEn : list.theme;
              return (
                <li key={list.id}>
                  <Link
                    href={localePath(locale, `/list/${list.slug}`)}
                    className="group flex items-baseline justify-between border-line border-b py-2.5"
                  >
                    <span className="font-bold transition-colors group-hover:text-brand">
                      {listTitle}
                    </span>
                    {listTheme && (
                      <span className="ml-4 truncate text-ink-muted text-sm">{listTheme}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
