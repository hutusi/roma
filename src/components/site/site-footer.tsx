import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-line border-t">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center">
        <p className="font-display text-ink-muted text-xs uppercase tracking-[0.35em]">
          Babuban · 8½
        </p>
        <p className="text-ink-muted text-sm">八部半 —— 献给黑白电影的策展手册</p>
        <p className="text-ink-muted text-xs">
          <Link href="/about" className="transition-colors hover:text-brand">
            关于本站
          </Link>
          <span className="mx-2">·</span>© {new Date().getFullYear()} babuban.com
        </p>
      </div>
    </footer>
  );
}
