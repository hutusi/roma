import Link from "next/link";
import { getDict } from "@/i18n/dict";
import { type Locale, localePath } from "@/i18n/locales";
import { AuthMenu } from "./auth-menu";
import { BrandMark } from "./brand-mark";
import { LangToggle } from "./lang-toggle";
import { MobileMenu, type NavItem } from "./mobile-menu";
import { NavLink } from "./nav-link";
import { SearchDialog } from "./search-dialog";

/**
 * One row at every width. From `sm` up it carries the sections, search,
 * account and language inline; below that, sections, account and
 * language fold into MobileMenu and only the brand and search stay —
 * CJK labels must never wrap a character per line. Search is a single
 * instance across breakpoints, so its ⌘K listener can't open two dialogs.
 */
export function SiteHeader({ locale = "zh" }: { locale?: Locale }) {
  const dict = getDict(locale);
  const path = (p: string) => localePath(locale, p);
  const nav: NavItem[] = [
    { href: path("/lists"), label: dict.nav.lists, sections: [path("/lists"), path("/list")] },
    { href: path("/films"), label: dict.nav.films, sections: [path("/films"), path("/film")] },
    { href: path("/about"), label: dict.nav.about, sections: [path("/about")] },
  ];

  return (
    <header className="relative border-line border-b">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6 sm:py-5">
        {/* shrink-0: as min-w-0 it let a long reader name squeeze the brand
            box at tablet widths, and its unwrapping text then ran under the
            nav. The Latin wordmark waits for lg, where there's room. */}
        <Link href={path("/")} className="group flex shrink-0 items-center gap-3">
          <BrandMark className="h-7 w-7 shrink-0" />
          <span className="whitespace-nowrap font-bold text-xl tracking-label">八部半</span>
          <span className="hidden whitespace-nowrap font-display text-ink-muted text-xs uppercase tracking-eyebrow transition-colors group-hover:text-brand lg:inline">
            Babuban · 8½
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-5 text-sm sm:gap-6">
          <nav aria-label={dict.nav.label} className="hidden items-center gap-6 sm:flex">
            {nav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                sections={item.sections}
                className="whitespace-nowrap tracking-label transition-colors hover:text-brand aria-[current=page]:text-brand"
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <SearchDialog locale={locale} labels={dict.search} />
          <div className="hidden sm:block">
            <AuthMenu locale={locale} labels={dict.authMenu} />
          </div>
          <div className="hidden sm:block">
            <LangToggle />
          </div>
          <div className="flex sm:hidden">
            <MobileMenu locale={locale} nav={nav} labels={dict.nav} authLabels={dict.authMenu} />
          </div>
        </div>
      </div>
    </header>
  );
}
