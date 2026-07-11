import Link from "next/link";
import { LocaleSwitch } from "@/components/site/locale-switch";
import { getDict } from "@/i18n/dict";
import { type Locale, localePath } from "@/i18n/locales";

export function SiteFooter({ locale = "zh" }: { locale?: Locale }) {
  const dict = getDict(locale);
  return (
    <footer className="mt-24 border-line border-t">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center">
        <p className="font-display text-ink-muted text-xs uppercase tracking-[0.35em]">
          Babuban · 8½
        </p>
        <p className="text-ink-muted text-sm">{dict.footer.tagline}</p>
        <p className="text-ink-muted text-xs">
          <Link href={localePath(locale, "/about")} className="transition-colors hover:text-brand">
            {dict.footer.aboutLink}
          </Link>
          <span className="mx-2">·</span>
          <LocaleSwitch locale={locale} path="/" className="transition-colors hover:text-brand" />
          <span className="mx-2">·</span>© {new Date().getFullYear()} babuban.com
        </p>
      </div>
    </footer>
  );
}
