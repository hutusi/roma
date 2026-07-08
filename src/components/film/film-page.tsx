import Link from "next/link";
import { AcademyFrame } from "@/components/site/academy-frame";
import { TitleCard } from "@/components/site/title-card";
import { TiptapContent } from "@/components/tiptap/render";
import { heroOf, type PublicFilm } from "@/db/queries/public";

const REGION_LABELS: Record<string, string> = {
  CN: "大陆",
  HK: "香港",
  TW: "台湾",
  INTL: "海外",
};

/**
 * Pure presentation of a film — consumed by the public /film/[slug]
 * page (published only) and the editor-gated draft preview, so both
 * always look identical.
 */
export function FilmPage({ film, actions }: { film: PublicFilm; actions?: React.ReactNode }) {
  const hero = heroOf(film.media);
  const directorNames = film.filmDirectors.map((fd) => ({
    slug: fd.director.slug,
    label: fd.director.nameZh ?? fd.director.name,
    published: fd.director.status === "published",
  }));

  const facts = [
    String(film.year),
    ...film.countries,
    film.runtimeMinutes ? `${film.runtimeMinutes} 分钟` : null,
    film.aspectRatio,
    film.isBlackAndWhite ? "黑白" : "彩色",
  ].filter(Boolean);

  const translations = [
    { label: "大陆", value: film.titleZh },
    { label: "香港", value: film.titleZhHk },
    { label: "台湾", value: film.titleZhTw },
    { label: "英文", value: film.titleEn },
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
        <AcademyFrame src={hero.url} alt={hero.alt ?? film.titleZh} credit={hero.credit} priority />
      )}

      <header className="mt-10 text-center">
        <h1 className="font-bold text-4xl tracking-[0.15em]">{film.titleZh}</h1>
        <p className="mt-3 font-display text-ink-muted text-lg">{film.titleOriginal}</p>
        <p className="mt-4 text-ink-muted text-sm tracking-[0.2em]">{facts.join(" · ")}</p>
        {directorNames.length > 0 && (
          <p className="mt-2 text-ink-muted text-sm">
            导演：
            {directorNames.map((d, i) => (
              <span key={d.slug}>
                {i > 0 && "、"}
                {d.published ? (
                  <Link href={`/director/${d.slug}`} className="text-brand hover:underline">
                    {d.label}
                  </Link>
                ) : (
                  d.label
                )}
              </span>
            ))}
          </p>
        )}
        {actions && <div className="mt-5 flex justify-center">{actions}</div>}
      </header>

      {film.editorialNote && (
        <section className="mt-14">
          <TitleCard eyebrow="Editorial Note" title="编辑札记" />
          <p className="mx-auto mt-8 max-w-[70ch] text-[17px] leading-[1.9] tracking-[0.02em]">
            {film.editorialNote}
          </p>
        </section>
      )}

      {film.essay && (
        <section className="mt-14">
          <TiptapContent doc={film.essay} className="mx-auto max-w-[70ch]" />
        </section>
      )}

      {translations.length > 1 && (
        <section className="mt-14">
          <TitleCard eyebrow="Titles" title="译名" />
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
              <dt className="text-ink-muted">原名</dt>
              <dd className="font-display">{film.titleOriginal}</dd>
            </div>
          </dl>
        </section>
      )}

      {film.castJson && film.castJson.length > 0 && (
        <section className="mt-14">
          <TitleCard eyebrow="Cast" title="主演" />
          <ul className="mx-auto mt-8 max-w-md space-y-2 text-[15px]">
            {film.castJson.slice(0, 10).map((member) => (
              <li key={member.name} className="flex justify-between border-line border-b py-1.5">
                <span>
                  {member.zhName ?? member.name}
                  {member.zhName && (
                    <span className="ml-2 font-display text-ink-muted text-sm">{member.name}</span>
                  )}
                </span>
                {member.character && <span className="text-ink-muted">饰 {member.character}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {watchByRegion.length > 0 && (
        <section className="mt-14">
          <TitleCard eyebrow="Where to Watch" title="哪里能看" />
          <div className="mx-auto mt-8 max-w-md space-y-4">
            {watchByRegion.map(([region, links]) => (
              <div key={region}>
                <p className="text-ink-muted text-sm tracking-[0.2em]">
                  {REGION_LABELS[region] ?? region}
                </p>
                <ul className="mt-1 space-y-1">
                  {links.map((link) => (
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
                      {link.note && <span className="text-ink-muted">{link.note}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-3 max-w-md text-ink-muted text-xs">
            观看渠道由编辑手工维护，可能随平台下架而失效。
          </p>
        </section>
      )}

      {film.relatedLists.length > 0 && (
        <section className="mt-14 pb-4">
          <TitleCard eyebrow="Curated Lists" title="相关片单" />
          <ul className="mx-auto mt-8 max-w-md space-y-2">
            {film.relatedLists.map((list) => (
              <li key={list.id}>
                <Link
                  href={`/list/${list.slug}`}
                  className="group flex items-baseline justify-between border-line border-b py-2.5"
                >
                  <span className="font-bold transition-colors group-hover:text-brand">
                    {list.title}
                  </span>
                  {list.theme && (
                    <span className="ml-4 truncate text-ink-muted text-sm">{list.theme}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
