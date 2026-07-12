import { desc, eq } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { TitleCard } from "@/components/site/title-card";
import { db } from "@/db";
import { listFollows } from "@/db/schema";
import { getDict } from "@/i18n/dict";
import { type Locale, localePath } from "@/i18n/locales";
import { requireUser } from "@/lib/auth-guards";

/**
 * The lists a user follows, rendered for both locales. Followed curated lists
 * are editorial: their titles/themes resolve to English on /en and link to
 * /en when en-published, else fall back to the zh list page.
 */
export async function FollowsPage({ locale = "zh" }: { locale?: Locale }) {
  const en = locale === "en";
  const t = getDict(locale).follows;
  const session = await requireUser(locale);
  const follows = await db.query.listFollows.findMany({
    where: eq(listFollows.userId, session.user.id),
    orderBy: desc(listFollows.createdAt),
    with: { list: { with: { cover: true, items: { columns: { id: true } } } } },
  });
  const lists = follows.map((f) => f.list).filter((list) => list.status === "published");

  return (
    <div className="mx-auto max-w-3xl animate-fade-up px-6 pt-16">
      <TitleCard eyebrow="Following" title={t.title} />
      <div className="mt-10 space-y-6 pb-8">
        {lists.map((list) => {
          const listTitle = en ? (list.titleEn ?? list.title) : list.title;
          const listTheme = en ? list.themeEn : list.theme;
          const href = localePath(locale, `/list/${list.slug}`);
          return (
            <Link
              key={list.id}
              href={href}
              className="group block border border-line bg-card transition-colors hover:border-brand"
            >
              {list.cover && (
                <div className="relative aspect-[137/60] overflow-hidden bg-ink">
                  <Image
                    src={list.cover.url}
                    alt={list.cover.alt ?? listTitle}
                    fill
                    sizes="(min-width: 768px) 768px, 100vw"
                    className="object-cover grayscale"
                  />
                </div>
              )}
              <div className="p-5 text-center">
                <h2 className="font-bold tracking-[0.1em] transition-colors group-hover:text-brand">
                  {listTitle}
                </h2>
                {listTheme && <p className="mt-1.5 text-ink-muted text-sm">{listTheme}</p>}
                <p className="mt-2 font-display text-ink-muted text-xs tracking-[0.3em]">
                  {list.items.length} FILMS
                </p>
              </div>
            </Link>
          );
        })}
        {lists.length === 0 && (
          <p className="py-8 text-center text-ink-muted">
            {t.emptyBefore}
            <Link href={localePath(locale, "/lists")} className="text-brand hover:underline">
              {t.emptyLink}
            </Link>
            {t.emptyAfter}
          </p>
        )}
      </div>
    </div>
  );
}
