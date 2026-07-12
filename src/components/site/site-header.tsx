import Link from "next/link";
import { getDict } from "@/i18n/dict";
import { type Locale, localePath } from "@/i18n/locales";
import { AuthMenu } from "./auth-menu";
import { LangToggle } from "./lang-toggle";

export function SiteHeader({ locale = "zh" }: { locale?: Locale }) {
  const dict = getDict(locale);
  const nav = [
    { href: localePath(locale, "/lists"), label: dict.nav.lists },
    { href: localePath(locale, "/films"), label: dict.nav.films },
    { href: localePath(locale, "/about"), label: dict.nav.about },
  ];

  return (
    <header className="border-line border-b">
      <div className="mx-auto flex max-w-5xl items-baseline justify-between px-6 py-5">
        <Link href={localePath(locale, "/")} className="group flex items-baseline gap-3">
          <span className="font-bold text-xl tracking-[0.2em]">八部半</span>
          <span className="hidden font-display text-ink-muted text-xs uppercase tracking-[0.3em] transition-colors group-hover:text-brand sm:inline">
            Babuban · 8½
          </span>
        </Link>
        <nav className="flex items-baseline gap-6 text-sm">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="tracking-[0.2em] transition-colors hover:text-brand"
            >
              {label}
            </Link>
          ))}
          <AuthMenu locale={locale} labels={dict.authMenu} />
          <LangToggle />
        </nav>
      </div>
    </header>
  );
}
