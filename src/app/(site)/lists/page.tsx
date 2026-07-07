import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TitleCard } from "@/components/site/title-card";
import { getPublishedLists } from "@/db/queries/public";

export const metadata: Metadata = {
  title: "片单",
  description: "八部半的策展片单：一个主题、一篇引言、一组按顺序排列的电影。",
};

export default async function ListsIndexPage() {
  const lists = await getPublishedLists();

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard eyebrow="Curated Lists" title="片单" />
      <p className="mx-auto mt-6 max-w-[60ch] text-center text-ink-muted">
        每份片单都是一篇文章：为什么是这些电影，为什么是这个顺序。
      </p>
      <div className="mt-12 space-y-8 pb-4">
        {lists.map((list) => (
          <Link
            key={list.id}
            href={`/list/${list.slug}`}
            className="group block border border-line bg-card transition-colors hover:border-brand"
          >
            {list.cover && (
              <div className="relative aspect-[137/60] overflow-hidden bg-ink">
                <Image
                  src={list.cover.url}
                  alt={list.cover.alt ?? list.title}
                  fill
                  sizes="(min-width: 768px) 768px, 100vw"
                  className="object-cover grayscale transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
            )}
            <div className="p-6 text-center">
              <h2 className="text-xl font-bold tracking-[0.1em] transition-colors group-hover:text-brand">
                {list.title}
              </h2>
              {list.theme && (
                <p className="mt-2 text-sm text-ink-muted">{list.theme}</p>
              )}
              <p className="mt-3 font-display text-xs tracking-[0.3em] text-ink-muted">
                {list.items.length} FILMS
              </p>
            </div>
          </Link>
        ))}
        {lists.length === 0 && (
          <p className="text-center text-ink-muted">首批片单正在撰写中。</p>
        )}
      </div>
    </div>
  );
}
