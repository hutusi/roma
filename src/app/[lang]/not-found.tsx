"use client";

import { useParams } from "next/navigation";
import { ButtonLink } from "@/components/site/button-link";
import { isLocale, localePath } from "@/i18n/locales";

// not-found receives no props; useParams is the documented way to read
// the [lang] segment from a client boundary (it can't call notFound(),
// so unknown values fall back to zh).
const COPY = {
  zh: {
    title: "此片散佚",
    body: "你要找的页面不存在——像许多默片一样，也许它从未被保存下来。",
    home: "回到首页",
  },
  en: {
    title: "Lost to time",
    body: "The page you are looking for does not exist — like many silent films, perhaps it was never preserved.",
    home: "Back to the home page",
  },
} as const;

export default function NotFound() {
  const params = useParams<{ lang?: string }>();
  const locale = params.lang && isLocale(params.lang) ? params.lang : "zh";
  const t = COPY[locale];
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-display text-ink-muted text-sm uppercase tracking-eyebrow">404</p>
      <h1 className="mt-4 font-bold text-3xl tracking-label">{t.title}</h1>
      <p className="mt-4 max-w-[44ch] text-ink-muted leading-[1.9]">{t.body}</p>
      <ButtonLink href={localePath(locale, "/")} className="mt-8">
        {t.home}
      </ButtonLink>
    </div>
  );
}
