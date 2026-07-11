import Link from "next/link";
import { Grain } from "@/components/site/grain";

/**
 * English home. Data sections (featured list, recent films) arrive with
 * the locale-parametrized queries; until entities carry published
 * English editions the subset is empty by definition.
 */
export default function EnHomePage() {
  return (
    <div className="animate-fade-up">
      <section className="relative overflow-hidden border-line border-b bg-paper">
        <Grain />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <p className="font-display text-ink-muted text-sm uppercase tracking-[0.4em]">
            Babuban · 8½
          </p>
          <h1 className="font-bold text-5xl tracking-[0.25em] sm:text-6xl">八部半</h1>
          <p className="max-w-[40ch] text-ink-muted text-lg leading-[1.9]">
            A curatorial handbook for classic cinema. Black-and-white images, director lineages, and
            lists worth watching in order.
          </p>
          <Link
            href="/en/lists"
            className="mt-4 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
          >
            Browse the lists
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 pt-20 pb-4">
        <p className="mx-auto max-w-2xl text-center text-ink-muted leading-[1.9]">
          The first English editions are being written. Inclusion is the recommendation — this is
          not a database.
        </p>
      </section>
    </div>
  );
}
