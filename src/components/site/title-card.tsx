import { cn } from "@/lib/utils";

/**
 * Silent-film title card: a centered header framed by thin hairlines,
 * with an optional small-caps eyebrow above the title. `as="h1"` when it
 * is the page's title (index pages, lists, profiles), h2 when it opens a
 * major section of a page that already has one.
 */
export function TitleCard({
  eyebrow,
  title,
  as: Heading = "h2",
  className,
}: {
  eyebrow?: string;
  title: string;
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <header className={cn("mx-auto max-w-2xl border-line border-y py-5 text-center", className)}>
      {eyebrow && (
        <p className="mb-2 font-display text-ink-muted text-xs uppercase tracking-eyebrow">
          {eyebrow}
        </p>
      )}
      <Heading className="text-balance font-bold text-2xl tracking-title sm:text-3xl">
        {title}
      </Heading>
    </header>
  );
}

/**
 * The lighter heading for short reference sections (titles, cast, where
 * to watch, related lists): the title between two hairlines, the same
 * device the list page uses to number its films. A page of identical
 * heavy title cards reads as all headline; this keeps them for the prose.
 */
export function SectionHeading({ title, className }: { title: string; className?: string }) {
  return (
    <div className={cn("mx-auto flex max-w-md items-center gap-4", className)}>
      <span className="h-px flex-1 bg-line" aria-hidden />
      <h2 className="font-bold text-base tracking-title">{title}</h2>
      <span className="h-px flex-1 bg-line" aria-hidden />
    </div>
  );
}
