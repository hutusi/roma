import Link from "next/link";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { HTML_LANG, type Locale } from "@/i18n/locales";

/**
 * A draft dressed as the public page it will become: the site's own
 * header and footer around it, and the edition's language on the wrapper,
 * so an EN preview sets its prose in Source Serif as /en does (the
 * :lang(en) rule in globals.css) instead of inheriting the zh admin's
 * fonts. Previously drafts rendered bare under a one-line note, which
 * hid how wide the page really sits and how its type falls.
 */
export function PreviewFrame({
  locale,
  editHref,
  children,
}: {
  locale: Locale;
  editHref: string;
  children: ReactNode;
}) {
  return (
    <div lang={HTML_LANG[locale]} className="flex min-h-full flex-1 flex-col font-body">
      <p
        lang="zh-CN"
        className="sticky top-0 z-50 border-line border-b bg-secondary px-4 py-2 text-center font-sans text-ink-muted text-xs"
      >
        草稿预览{locale === "en" && "（英文版）"} · 读者视角，与公开页同一组件 ·{" "}
        <Link href={editHref} className="text-brand hover:underline">
          返回编辑
        </Link>
      </p>
      <SiteHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} />
    </div>
  );
}
