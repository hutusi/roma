import type { Metadata } from "next";
import { TitleCard } from "@/components/site/title-card";
import { languageAlternates } from "@/i18n/alternates";
import type { Locale } from "@/i18n/locales";
import { parseLocale } from "@/i18n/params";
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
  const t = COPY[parseLocale((await params).lang)];
  return {
    title: t.title,
    description: t.description,
    alternates: { languages: languageAlternates("/about", { en: true }) },
  };
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const locale = parseLocale((await params).lang);
  return (
    <article className="mx-auto max-w-[70ch] animate-fade-up px-6 pt-16">
      <TitleCard eyebrow="About" title={HEADING[locale]} />
      {locale === "en" ? <AboutEn /> : <AboutZh />}
    </article>
  );
}
