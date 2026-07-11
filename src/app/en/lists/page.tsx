import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TitleCard } from "@/components/site/title-card";
import { getPublishedLists } from "@/db/queries/public";

export const metadata: Metadata = {
  title: "Lists",
  description: "Babuban's curated lists: a theme, an introduction, films in a deliberate order.",
};

export default async function EnListsIndexPage() {
  const lists = await getPublishedLists("en");

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard title="Curated Lists" />
      <p className="mx-auto mt-6 max-w-[60ch] text-center text-ink-muted">
        Every list is an essay: why these films, and why this order.
      </p>
      <div className="mt-12 space-y-8 pb-4">
        {lists.map((list) => {
          const title = list.titleEn ?? list.title;
          return (
            <Link
              key={list.id}
              href={`/en/list/${list.slug}`}
              className="group block border border-line bg-card transition-colors hover:border-brand"
            >
              {list.cover && (
                <div className="relative aspect-[137/60] overflow-hidden bg-ink">
                  <Image
                    src={list.cover.url}
                    alt={list.cover.alt ?? title}
                    fill
                    sizes="(min-width: 768px) 768px, 100vw"
                    className="object-cover grayscale transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>
              )}
              <div className="p-6 text-center">
                <h2 className="font-bold text-xl tracking-[0.1em] transition-colors group-hover:text-brand">
                  {title}
                </h2>
                {list.themeEn && <p className="mt-2 text-ink-muted text-sm">{list.themeEn}</p>}
                <p className="mt-3 font-display text-ink-muted text-xs tracking-[0.3em]">
                  {list.items.length} FILMS
                </p>
              </div>
            </Link>
          );
        })}
        {lists.length === 0 && (
          <p className="text-center text-ink-muted">The first English lists are on their way.</p>
        )}
      </div>
    </div>
  );
}
