import Link from "next/link";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-display text-sm uppercase tracking-[0.4em] text-ink-muted">
          404
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-[0.2em]">此片散佚</h1>
        <p className="mt-4 max-w-[40ch] leading-[1.9] text-ink-muted">
          你要找的页面不存在——像许多默片一样，也许它从未被保存下来。
        </p>
        <Link
          href="/"
          className="mt-8 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
        >
          回到首页
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
