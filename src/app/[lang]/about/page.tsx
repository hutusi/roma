import type { Metadata } from "next";
import { ButtonLink } from "@/components/site/button-link";
import { TitleCard } from "@/components/site/title-card";
import { type Locale, localePath } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
import { seoMetadata } from "@/lib/seo";
import { AboutEn } from "./about-en";
import { AboutZh } from "./about-zh";

const COPY: Record<Locale, { title: string; description: string }> = {
  zh: { title: "关于", description: "八部半是什么，以及它为什么存在。" },
  en: { title: "About", description: "What Babuban is, and why it exists." },
};

const HEADING: Record<Locale, string> = { zh: "关于八部半", en: "About Babuban" };

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
    ...seoMetadata(locale, "/about", { en: true }),
  };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = parseLocale((await params).lang);
  return (
    <article className="mx-auto max-w-measure animate-fade-up px-6 pt-16">
      <TitleCard as="h1" eyebrow="About" title={HEADING[locale]} />
      {locale === "en" ? <AboutEn /> : <AboutZh />}
      {/* Reading about the site should end at the thing it is about. */}
      <p className="mt-12 pb-4 text-center">
        <ButtonLink href={localePath(locale, "/lists")}>
          {locale === "en" ? "Browse the lists" : "浏览片单"}
        </ButtonLink>
      </p>
    </article>
  );
}
