import Link from "next/link";
import { localePath } from "@/i18n/locales";

/**
 * /en stand-in for a zh-published entity whose English edition isn't
 * written yet (ADR 0012): instead of a 404, the reader gets the entity
 * name and a route to the Chinese page. English-only by construction —
 * callers feed it from the get*StubBySlug queries, which never select
 * zh prose. Pages rendering this must set robots noindex and emit no
 * en hreflang or JSON-LD.
 */
export function TranslationPending({
  title,
  subtitle,
  year,
  zhHref,
}: {
  title: string;
  subtitle?: string | null;
  year?: number;
  zhHref: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-display text-ink-muted text-sm uppercase tracking-[0.4em]">
        Translation Pending
      </p>
      <h1 className="mt-4 font-bold text-3xl tracking-[0.1em]">{title}</h1>
      {(subtitle || year) && (
        <p className="mt-3 font-display text-ink-muted">
          {subtitle}
          {subtitle && year ? " · " : ""}
          {year}
        </p>
      )}
      <p className="mt-6 max-w-[44ch] text-ink-muted leading-[1.9]">
        The English edition of this entry hasn&rsquo;t been written yet — Babuban translates its
        catalogue one essay at a time.
      </p>
      <Link
        href={zhHref}
        className="mt-8 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
      >
        Read the Chinese edition →
      </Link>
      <Link
        href={localePath("en", "/")}
        className="mt-6 text-ink-muted text-sm tracking-[0.2em] transition-colors hover:text-brand"
      >
        Back to the home page
      </Link>
    </div>
  );
}
