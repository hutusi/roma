import Link from "next/link";
import { AcademyFrame } from "@/components/site/academy-frame";
import { FilmCard } from "@/components/site/film-card";
import { LocaleSwitch } from "@/components/site/locale-switch";
import { SectionHeading, TitleCard } from "@/components/site/title-card";
import { TiptapContent } from "@/components/tiptap/render";
import { type FilmCardRow, heroOf, type PublicFilm, posterOf } from "@/db/queries/public";
import { countryToEn } from "@/i18n/countries";
import { getDict } from "@/i18n/dict";
import { type Locale, localePath } from "@/i18n/locales";
import { externalLinks } from "@/lib/external-ids";
import { personPath } from "@/lib/routes";

/**
 * Latin eyebrows are locale-neutral; zh pairs them with a zh title, en
 * drops them. Only the prose sections get a title card — the short
 * reference sections below them take the lighter SectionHeading.
 */
const EYEBROWS = {
  introduction: "Introduction",
  editorialNote: "Editorial Note",
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
  moreFilms = [],
}: {
  film: PublicFilm;
  locale?: Locale;
  actions?: React.ReactNode;
  /** Other films by the same director(s), already filtered to this edition. */
  moreFilms?: FilmCardRow[];
}) {
  const dict = getDict(locale).film;
  const en = locale === "en";
  const eyebrow = (key: keyof typeof EYEBROWS) => (en ? undefined : EYEBROWS[key]);

  const hero = heroOf(film.media);
  const displayTitle = en ? (film.titleEn ?? film.titleOriginal) : film.titleZh;
  const subtitle = film.titleOriginal !== displayTitle ? film.titleOriginal : null;
  const introduction = en ? film.introductionEn : film.introduction;
  const editorialNote = en ? film.editorialNoteEn : film.editorialNote;
  const essay = en ? film.essayEn : film.essay;

  const directorNames = film.filmDirectors.map((fd) => ({
    slug: fd.director.slug,
    // Canonical segment per person — an actor-primary co-director links
    // straight to /actor/… instead of bouncing through a 308.
    path: personPath(fd.director),
    label: en ? fd.director.name : (fd.director.nameZh ?? fd.director.name),
    linked: fd.director.status === "published",
  }));

  const facts = [
    String(film.year),
    ...film.countries.map((c) => (en ? countryToEn(c) : c)),
    film.runtimeMinutes ? dict.runtime(film.runtimeMinutes) : null,
    film.aspectRatio,
    film.isBlackAndWhite ? dict.blackAndWhite : dict.color,
    // Talkies are the default; only silence is worth a word.
    film.isSilent ? dict.silent : null,
  ].filter(Boolean);

  const elsewhere = externalLinks(film, locale);
  const restoration = en ? film.restorationNoteEn : film.restorationNote;

  // Chips are safe on /en without a gate: nameEn is NOT NULL by schema
  // (ADR 0014), and a tag's visibility rides on the film itself.
  const tagChips = film.filmTags
    .map((ft) => ({ slug: ft.tag.slug, label: en ? ft.tag.nameEn : ft.tag.nameZh }))
    .sort((a, b) => a.label.localeCompare(b.label, en ? "en" : "zh"));

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
          color={hero.dominantColor}
          locale={locale}
          preload
        />
      )}

      <header className="mt-10 text-center">
        <h1 className="text-balance break-words font-bold text-3xl tracking-title sm:text-4xl">
          {displayTitle}
        </h1>
        {subtitle && <p className="mt-3 font-display text-ink-muted text-lg">{subtitle}</p>}
        <p className="mt-4 text-ink-muted text-sm tracking-label">{facts.join(" · ")}</p>
        {directorNames.length > 0 && (
          <p className="mt-2 text-ink-muted text-sm">
            {dict.directedBy}
            {directorNames.map((d, i) => (
              <span key={d.slug}>
                {i > 0 && dict.nameSeparator}
                {d.linked ? (
                  <Link href={localePath(locale, d.path)} className="text-brand hover:underline">
                    {d.label}
                  </Link>
                ) : (
                  d.label
                )}
              </span>
            ))}
          </p>
        )}
        {tagChips.length > 0 && (
          <p className="mt-4 flex flex-wrap justify-center gap-2">
            {tagChips.map((t) => (
              <Link
                key={t.slug}
                href={localePath(locale, `/films?tag=${t.slug}`)}
                className="border border-line px-2 py-0.5 text-ink-muted text-xs tracking-title transition-colors hover:border-brand hover:text-brand"
              >
                {t.label}
              </Link>
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

      {introduction && (
        <section className="mt-14">
          <TitleCard eyebrow={eyebrow("introduction")} title={dict.introduction} />
          <p className="mx-auto mt-8 max-w-measure text-prose tracking-body">{introduction}</p>
        </section>
      )}

      {/*
        Optional, and in an editor's own voice rather than the neutral
        register of the introduction. Its own heading carries that
        distinction, so the prose itself is set like body text: at a few
        hundred characters, italics and a narrow measure fight reading.
      */}
      {editorialNote && (
        <section className="mt-14">
          <TitleCard eyebrow={eyebrow("editorialNote")} title={dict.editorialNote} />
          <p className="mx-auto mt-8 max-w-measure text-prose tracking-body">{editorialNote}</p>
        </section>
      )}

      {essay && (
        <section className="mt-14">
          <TiptapContent doc={essay} className="mx-auto max-w-measure" />
        </section>
      )}

      {translations.length > 1 && (
        <section className="mt-14">
          <SectionHeading title={dict.titles} />
          <dl className="mx-auto mt-8 max-w-md">
            {translations.map((t) => (
              <div
                key={t.label}
                className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-line border-b py-2.5 text-ui"
              >
                <dt className="text-ink-muted">{t.label}</dt>
                <dd>{t.value}</dd>
              </div>
            ))}
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-2.5 text-ui">
              <dt className="text-ink-muted">{dict.titleLabels.original}</dt>
              <dd className="font-display">{film.titleOriginal}</dd>
            </div>
          </dl>
        </section>
      )}

      {film.cast.length > 0 && (
        <section className="mt-14">
          <SectionHeading title={dict.cast} />
          <ul className="mx-auto mt-8 max-w-md space-y-2 text-ui">
            {film.cast.slice(0, 10).map((member) => {
              // Same gate as the directedBy line: zh-published links even
              // on /en, where an en-pending person resolves to the
              // translation-pending stub (ADR 0012 sanctions this).
              const linked = member.person && member.person.status === "published";
              const label = en ? member.name : (member.nameZh ?? member.name);
              // Same split as names: /en shows the Latin/original role only.
              const role = en ? member.character : (member.characterZh ?? member.character);
              return (
                <li
                  key={member.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-line border-b py-1.5"
                >
                  <span>
                    {linked && member.person ? (
                      <Link
                        href={localePath(locale, personPath(member.person))}
                        className="text-brand hover:underline"
                      >
                        {label}
                      </Link>
                    ) : (
                      label
                    )}
                    {!en && member.nameZh && (
                      <span className="ml-2 font-display text-ink-muted text-sm">
                        {member.name}
                      </span>
                    )}
                  </span>
                  {role && <span className="text-ink-muted">{dict.castAs(role)}</span>}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {watchByRegion.length > 0 && (
        <section className="mt-14">
          <SectionHeading title={dict.watch} />
          <div className="mx-auto mt-8 max-w-md space-y-4">
            {watchByRegion.map(([region, links]) => (
              <div key={region}>
                <p className="text-ink-muted text-sm tracking-label">
                  {dict.regions[region as keyof typeof dict.regions] ?? region}
                </p>
                <ul className="mt-1 space-y-1">
                  {links.map((link) => {
                    const note = en ? link.noteEn : link.note;
                    return (
                      <li
                        key={link.id}
                        className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-line border-b py-1.5 text-ui"
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

      {(restoration || elsewhere.length > 0) && (
        <section className="mx-auto mt-14 max-w-md text-center">
          {restoration && (
            <p className="text-ink-muted text-sm">
              {dict.restoration}
              {restoration}
            </p>
          )}
          {elsewhere.length > 0 && (
            <p className="mt-2 text-ink-muted text-sm">
              {dict.elsewhere}
              {elsewhere.map((link, i) => (
                <span key={link.key}>
                  {i > 0 && " · "}
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:underline"
                  >
                    {dict.externalSites[link.key]}
                  </a>
                </span>
              ))}
            </p>
          )}
        </section>
      )}

      {film.relatedLists.length > 0 && (
        <section className="mt-14 pb-4">
          <SectionHeading title={dict.relatedLists} />
          <ul className="mx-auto mt-8 max-w-md space-y-2">
            {film.relatedLists.map((list) => {
              const listTitle = en ? (list.titleEn ?? list.title) : list.title;
              const listTheme = en ? list.themeEn : list.theme;
              return (
                <li key={list.id}>
                  <Link
                    href={localePath(locale, `/list/${list.slug}`)}
                    className="group flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-line border-b py-2.5"
                  >
                    <span className="font-bold transition-colors group-hover:text-brand">
                      {listTitle}
                    </span>
                    {listTheme && (
                      <span className="min-w-0 truncate text-ink-muted text-sm">{listTheme}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* The page never ends in a dead end: more by the same hands, then the catalogue. */}
      {moreFilms.length > 0 && (
        <section className="mt-14">
          <SectionHeading title={dict.moreByDirector} />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {moreFilms.map((other) => {
              const poster = posterOf(other.media);
              const title = en ? (other.titleEn ?? other.titleOriginal) : other.titleZh;
              return (
                <FilmCard
                  key={other.id}
                  href={localePath(locale, `/film/${other.slug}`)}
                  title={title}
                  subtitle={other.titleOriginal !== title ? other.titleOriginal : null}
                  year={other.year}
                  directorsLabel={other.filmDirectors
                    .map((fd) => (en ? fd.director.name : (fd.director.nameZh ?? fd.director.name)))
                    .join(dict.nameSeparator)}
                  imageUrl={poster?.url}
                  imageAlt={poster?.alt}
                  imageColor={poster?.dominantColor}
                />
              );
            })}
          </div>
        </section>
      )}
      <p className="mt-14 pb-4 text-center">
        <Link
          href={localePath(locale, "/films")}
          className="text-ink-muted text-sm tracking-label transition-colors hover:text-brand"
        >
          {dict.allFilms} →
        </Link>
      </p>
    </article>
  );
}
