import Link from "next/link";

const NAV = [
  { href: "/lists", label: "片单" },
  { href: "/films", label: "影片" },
  { href: "/about", label: "关于" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-baseline justify-between px-6 py-5">
        <Link href="/" className="group flex items-baseline gap-3">
          <span className="text-xl font-bold tracking-[0.2em]">八部半</span>
          <span className="hidden font-display text-xs uppercase tracking-[0.3em] text-ink-muted transition-colors group-hover:text-brand sm:inline">
            Babuban · 8½
          </span>
        </Link>
        <nav className="flex items-baseline gap-6 text-sm">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="tracking-[0.2em] transition-colors hover:text-brand"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
