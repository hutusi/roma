import Link from "next/link";
import { requireEditor, roleOf } from "@/lib/auth-guards";
import { SignOutButton } from "./sign-out-button";

const NAV = [{ href: "/admin", label: "仪表盘" }] as const;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // UX gate only — every admin page/action re-checks via its own guard,
  // since layouts don't re-run on soft navigation.
  const session = await requireEditor();

  return (
    <div className="flex min-h-full flex-1 font-sans text-[15px]">
      <aside className="flex w-52 shrink-0 flex-col border-r border-line bg-secondary/40 px-4 py-6">
        <Link href="/admin" className="px-2 font-bold tracking-[0.2em]">
          八部半 · 编辑部
        </Link>
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded px-2 py-1.5 transition-colors hover:bg-accent hover:text-brand"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-line pt-4 text-sm">
          <p className="truncate px-2 text-ink-muted">
            {session.user.name}（{roleOf(session) === "admin" ? "管理员" : "编辑"}）
          </p>
          <SignOutButton />
        </div>
      </aside>
      <div className="flex-1 px-8 py-6">{children}</div>
    </div>
  );
}
