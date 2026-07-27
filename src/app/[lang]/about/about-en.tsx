/** The en about prose. Long-form copy lives in per-locale components so
 * neither language's prose can leak into the other's page. */
export function AboutEn() {
  return (
    <div className="mt-10 space-y-6 text-[17px] leading-[1.9] tracking-[0.02em]">
      <p>
        Babuban (八部半, &ldquo;eight and a half&rdquo;) takes its name from Fellini&rsquo;s 1963{" "}
        <em>8½</em> — a film about how films get made, and about facing yourself honestly. We
        borrowed the name as a reminder: talking about cinema is, in the end, talking about how to
        live.
      </p>
      <p>
        This is not a database. A film&rsquo;s complete credits can be found anywhere else; why it
        deserves to be watched today cannot. Babuban only includes films we genuinely want to
        recommend — inclusion is the position.
      </p>
      <p>
        Lists are the heart of this site. A list has a theme, an introduction, a reason for every
        film&rsquo;s inclusion, and a deliberate order — it is meant to be read end to end, like an
        essay. We love classic cinema, not only out of nostalgia, but as a tribute to the masters
        who made it.
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
        , credited beneath each image. This site uses the TMDB API but is not endorsed or certified
        by TMDB. Where-to-watch links are maintained by hand.
      </p>
    </div>
  );
}
