import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { DocumentShell } from "@/components/layout/document-shell";
import { Toaster } from "@/components/ui/sonner";
import { requireEditor, roleOf } from "@/lib/auth-guards";
import { SITE_URL } from "@/lib/site";
import { SignOutButton } from "./sign-out-button";

// Admin is its own root-layout tree (zh-only, outside app/[lang]): the
// static /admin segment wins over [lang] in route matching, and editors
// crossing between admin and the site get a full page load (ADR 0012).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "编辑部 — 八部半",
    template: "%s — 八部半",
  },
  robots: { index: false },
};

export const viewport: Viewport = { themeColor: "#faf8f4" };

const NAV = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/films", label: "影片" },
  { href: "/admin/directors", label: "导演" },
  { href: "/admin/lists", label: "片单" },
  { href: "/admin/media", label: "媒体库" },
  { href: "/admin/users", label: "用户", adminOnly: true },
  { href: "/admin/invites", label: "邀请", adminOnly: true },
  { href: "/admin/metrics", label: "性能", adminOnly: true },
  { href: "/admin/handbook", label: "编辑手册" },
] as const;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // UX gate only — every admin page/action re-checks via its own guard,
  // since layouts don't re-run on soft navigation.
  const session = await requireEditor();

  return (
    <DocumentShell lang="zh-CN">
      <div className="flex min-h-full flex-1 font-sans text-[15px]">
        <aside className="flex w-52 shrink-0 flex-col border-line border-r bg-secondary/40 px-4 py-6">
          <Link href="/admin" className="px-2 font-bold tracking-[0.2em]">
            八部半 · 编辑部
          </Link>
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {NAV.filter(
              (item) => !("adminOnly" in item && item.adminOnly) || roleOf(session) === "admin",
            ).map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="rounded px-2 py-1.5 transition-colors hover:bg-accent hover:text-brand"
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="border-line border-t pt-4 text-sm">
            <p className="truncate px-2 text-ink-muted">
              {session.user.name}（{roleOf(session) === "admin" ? "管理员" : "编辑"}）
            </p>
            <SignOutButton />
          </div>
        </aside>
        <div className="flex-1 px-8 py-6">{children}</div>
        <Toaster position="top-center" />
      </div>
    </DocumentShell>
  );
}
