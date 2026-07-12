import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TitleCard } from "@/components/site/title-card";
import { getPublishedLists } from "@/db/queries/public";
import { localePath } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { seoMetadata } from "@/lib/seo";

const COPY = {
  zh: {
    title: "片单",
    eyebrow: "Curated Lists" as string | undefined,
    description: "八部半的策展片单：一个主题、一篇引言、一组按顺序排列的电影。",
    intro: "每份片单都是一篇文章：为什么是这些电影，为什么是这个顺序。",
    empty: "首批片单正在撰写中。",
  },
  en: {
    title: "Curated Lists",
    eyebrow: undefined as string | undefined,
    description: "Babuban's curated lists: a theme, an introduction, films in a deliberate order.",
    intro: "Every list is an essay: why these films, and why this order.",
    empty: "The first English lists are on their way.",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const locale = parseLocale((await params).lang);
  const t = COPY[locale];
  return {
    title: t.title,
    description: t.description,
    ...seoMetadata(locale, "/lists", { en: true }),
  };
}

export default async function ListsIndexPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = parseLocale((await params).lang);
  const en = locale === "en";
  const t = COPY[locale];
  const lists = await getPublishedLists(locale);

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard eyebrow={t.eyebrow} title={t.title} />
      <p className="mx-auto mt-6 max-w-[60ch] text-center text-ink-muted">{t.intro}</p>
      <div className="mt-12 space-y-8 pb-4">
        {lists.map((list) => {
          const title = en ? (list.titleEn ?? list.title) : list.title;
          const theme = en ? list.themeEn : list.theme;
          return (
            <Link
              key={list.id}
              href={localePath(locale, `/list/${list.slug}`)}
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
                {theme && <p className="mt-2 text-ink-muted text-sm">{theme}</p>}
                <p className="mt-3 font-display text-ink-muted text-xs tracking-[0.3em]">
                  {list.items.length} FILMS
                </p>
              </div>
            </Link>
          );
        })}
        {lists.length === 0 && <p className="text-center text-ink-muted">{t.empty}</p>}
      </div>
    </div>
  );
}
