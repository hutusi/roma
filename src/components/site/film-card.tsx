import Image from "next/image";
import Link from "next/link";

/**
 * Compact film reference used on index pages, list pages, and home:
 * a small Academy-ratio thumb on ink, titles, year, directors. Purely
 * presentational — callers resolve locale-specific titles and joined
 * director names.
 */
export function FilmCard({
  href,
  title,
  subtitle,
  year,
  directorsLabel,
  imageUrl,
  imageAlt,
}: {
  href: string;
  title: string;
  /** Secondary title line; omitted when it would repeat the title. */
  subtitle?: string | null;
  year: number;
  directorsLabel?: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
}) {
  return (
    <Link
      href={href}
      className="group flex gap-4 border border-line bg-card p-4 transition-colors hover:border-brand"
    >
      <div className="relative aspect-[137/100] w-28 shrink-0 overflow-hidden bg-ink sm:w-36">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? title}
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
        <p className="font-bold transition-colors group-hover:text-brand">{title}</p>
        <p className="mt-0.5 truncate font-display text-ink-muted text-sm">
          {/* Dedupe here so no caller can render the title twice. */}
          {subtitle && subtitle !== title ? `${subtitle} · ${year}` : year}
        </p>
        {directorsLabel && <p className="mt-1 text-ink-muted text-sm">{directorsLabel}</p>}
      </div>
    </Link>
  );
}
