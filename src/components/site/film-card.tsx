import Image from "next/image";
import Link from "next/link";

/**
 * Compact film reference used on index pages, list pages, and home: a
 * portrait thumbnail, titles, year, directors. Purely presentational —
 * callers resolve locale-specific titles and joined director names.
 *
 * Every card shares one 2:3 frame, so a grid's rows line up whatever the
 * image: posters fill it, and the rare film with only a still is
 * centre-cropped. (The Academy-ratio letterbox, where composition
 * matters, stays on detail pages.) Until the image arrives the frame
 * shows its dominant colour (paper-toned when unknown), not a black hole.
 */
export function FilmCard({
  href,
  title,
  subtitle,
  year,
  directorsLabel,
  imageUrl,
  imageAlt,
  imageColor,
}: {
  href: string;
  title: string;
  /** Secondary title line; omitted when it would repeat the title. */
  subtitle?: string | null;
  year: number;
  directorsLabel?: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  /** The image's dominant colour, painted in the frame while it loads. */
  imageColor?: string | null;
}) {
  // Dedupe here so no caller can render the title twice.
  const secondary = subtitle && subtitle !== title ? subtitle : null;
  return (
    <Link
      href={href}
      className="group flex gap-4 border border-line bg-card p-3 transition-colors hover:border-brand sm:p-4"
    >
      <div
        className="relative aspect-[2/3] w-20 shrink-0 overflow-hidden bg-secondary sm:w-24"
        style={imageColor ? { backgroundColor: imageColor } : undefined}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt ?? title}
            fill
            sizes="(min-width: 640px) 96px, 80px"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full items-center justify-center font-display text-ink-muted/60 text-sm"
          >
            {year}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 self-center">
        <p className="line-clamp-2 break-words font-bold transition-colors group-hover:text-brand">
          {title}
        </p>
        {/* The year never truncates; a long original title does. */}
        <p className="mt-1 flex min-w-0 font-display text-ink-muted text-sm">
          {secondary && (
            <>
              <span className="truncate">{secondary}</span>
              <span className="shrink-0 px-1">·</span>
            </>
          )}
          <span className="shrink-0">{year}</span>
        </p>
        {directorsLabel && <p className="mt-1 truncate text-ink-muted text-sm">{directorsLabel}</p>}
      </div>
    </Link>
  );
}
