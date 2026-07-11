import type { Metadata } from "next";
import { TitleCard } from "@/components/site/title-card";
import { languageAlternates } from "@/i18n/alternates";

export const metadata: Metadata = {
  title: "About",
  description: "What Babuban is, and why it exists.",
  alternates: { languages: languageAlternates("/about", { en: true }) },
};

export default function EnAboutPage() {
  return (
    <article className="mx-auto max-w-[70ch] animate-fade-up px-6 pt-16">
      <TitleCard eyebrow="About" title="About Babuban" />
      <div className="mt-10 space-y-6 text-[17px] leading-[1.9] tracking-[0.02em]">
        <p>
          Babuban (八部半, &ldquo;eight and a half&rdquo;) takes its name from Fellini&rsquo;s 1963{" "}
          <em>8½</em> — a film about how films get made, and about facing yourself honestly. We
          borrowed the name as a reminder: talking about cinema is, in the end, talking about how to
          live.
        </p>
        <p>
          This is not a database. You can look up a film&rsquo;s complete credits anywhere else, but
          not why it deserves to be watched today. Babuban only includes films we genuinely want to
          recommend — inclusion is the position. Every film carries an editorial note that tells you
          what makes it good and when to watch it.
        </p>
        <p>
          Lists are the heart of this site. A list has a theme, an introduction, a reason for every
          film&rsquo;s inclusion, and a deliberate order — it should be read the way you read an
          essay. We favor black-and-white film, not out of nostalgia, but because where there is no
          color, light, shadow, and composition must say everything.
        </p>
        <p>
          Babuban is kept by a few editors. It updates slowly, and every update is argued over
          first. If a film appears here, it is because someone was willing to put their name behind
          it. The English edition is a curated subset of the Chinese site: a film appears here once
          its English edition has been written and published.
        </p>
        <p className="border-line border-t pt-6 text-ink-muted text-sm">
          Posters, stills, and some metadata come from
          <a
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-1 text-brand hover:underline"
          >
            TMDB
          </a>
          , credited beneath each image. This site uses the TMDB API but is not endorsed or
          certified by TMDB. Where-to-watch links are maintained by hand.
        </p>
      </div>
    </article>
  );
}
