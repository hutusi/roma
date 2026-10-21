import type { Metadata, Viewport } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { DirtyGuardProvider } from "@/components/admin/dirty-guard";
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
  { href: "/admin/people", label: "人物" },
  { href: "/admin/lists", label: "片单" },
  { href: "/admin/tags", label: "标签" },
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

  const nav = NAV.filter(
    (item) => !("adminOnly" in item && item.adminOnly) || roleOf(session) === "admin",
  ).map(({ href, label }) => ({ href, label }));

  return (
    <DocumentShell lang="zh-CN">
      <DirtyGuardProvider>
        <AdminShell
          nav={nav}
          account={
            <>
              <p className="truncate px-2 text-ink-muted">
                {session.user.name}（{roleOf(session) === "admin" ? "管理员" : "编辑"}）
              </p>
              {/* The site itself, in a new tab — for checking what readers see. */}
              <a
                href="/zh"
                target="_blank"
                rel="noopener"
                className="mt-1 block rounded px-2 py-1.5 text-ink-muted transition-colors hover:bg-accent hover:text-brand"
              >
                查看前台 ↗
              </a>
              <SignOutButton />
            </>
          }
        >
          {children}
        </AdminShell>
        <Toaster position="top-center" />
      </DirtyGuardProvider>
    </DocumentShell>
  );
}
