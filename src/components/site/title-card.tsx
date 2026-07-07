import { cn } from "@/lib/utils";

/**
 * Silent-film title card: a centered section header framed by thin
 * hairlines, with an optional small-caps eyebrow line above the title.
 */
export function TitleCard({
  eyebrow,
  title,
  className,
}: {
  eyebrow?: string;
  title: string;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "mx-auto max-w-2xl border-y border-line py-5 text-center",
        className,
      )}
    >
      {eyebrow && (
        <p className="mb-2 font-display text-xs uppercase tracking-[0.35em] text-ink-muted">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-bold tracking-[0.15em] sm:text-3xl">
        {title}
      </h2>
    </header>
  );
}
