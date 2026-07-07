import Image from "next/image";
import Link from "next/link";

/**
 * Compact film reference used on index pages, list pages, and home:
 * a small Academy-ratio thumb on ink, titles, year, directors.
 */
export function FilmCard({
  slug,
  titleZh,
  titleOriginal,
  year,
  directors,
  imageUrl,
  imageAlt,
}: {
  slug: string;
  titleZh: string;
  titleOriginal: string;
  year: number;
  directors: string[];
  imageUrl?: string | null;
  imageAlt?: string | null;
}) {
  return (
    <Link
      href={`/film/${slug}`}
      className="group flex gap-4 border border-line bg-card p-4 transition-colors hover:border-brand"
    >
      <div className="relative aspect-[137/100] w-28 shrink-0 overflow-hidden bg-ink sm:w-36">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? titleZh}
            fill
            sizes="144px"
            className="object-contain"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full items-center justify-center font-display text-lg text-paper/25"
          >
            {year}
          </div>
        )}
      </div>
      <div className="min-w-0 self-center">
        <p className="font-bold transition-colors group-hover:text-brand">
          {titleZh}
        </p>
        <p className="mt-0.5 truncate font-display text-sm text-ink-muted">
          {titleOriginal} · {year}
        </p>
        {directors.length > 0 && (
          <p className="mt-1 text-sm text-ink-muted">{directors.join("、")}</p>
        )}
      </div>
    </Link>
  );
}
