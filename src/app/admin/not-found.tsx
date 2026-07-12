import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="font-display text-ink-muted text-sm uppercase tracking-[0.4em]">404</p>
      <h1 className="mt-4 font-bold text-2xl tracking-[0.2em]">页面不存在</h1>
      <Link
        href="/admin"
        className="mt-8 border border-ink px-8 py-3 text-sm tracking-[0.3em] transition-colors hover:border-brand hover:text-brand"
      >
        回到仪表盘
      </Link>
    </div>
  );
}
