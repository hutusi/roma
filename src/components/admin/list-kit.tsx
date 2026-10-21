import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

/**
 * The pieces every admin index page shares — header with a count,
 * search, pagination, status badges — so the films, people and lists
 * pages behave alike instead of each improvising (only films could be
 * searched; all three stopped silently at 200 rows).
 */

export const PAGE_SIZE = 50;

/** `?page=` as a 1-based page number, clamped to something sane. */
export function pageParam(raw: string | undefined): number {
  const n = Number(raw);
  return Number.isInteger(n) && n > 1 ? Math.min(n, 10_000) : 1;
}

/**
 * A user's search text as an ILIKE pattern. % and _ are wildcards there,
 * so a search for "100%" matched everything; escaped, they mean
 * themselves.
 */
export function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

export function AdminIndexHeader({
  title,
  count,
  action,
}: {
  title: string;
  count: number;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-baseline gap-2">
        <h1 className="font-bold text-xl">{title}</h1>
        <span className="text-ink-muted text-sm tabular-nums">共 {count} 条</span>
      </div>
      {action}
    </div>
  );
}

/** Builds an index URL from its params, dropping the empty ones. */
export function indexHref(basePath: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value);
  const query = search.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function AdminSearch({
  action,
  q,
  placeholder,
  keep = {},
}: {
  action: string;
  q?: string;
  placeholder: string;
  /** Other filters a search should keep (a GET form sends only its fields). */
  keep?: Record<string, string | undefined>;
}) {
  return (
    <form className="mt-4 flex max-w-sm items-center gap-2" action={action}>
      <Input
        name="q"
        type="search"
        placeholder={placeholder}
        defaultValue={q}
        aria-label={placeholder}
      />
      {Object.entries(keep).map(
        ([name, value]) => value && <input key={name} type="hidden" name={name} value={value} />,
      )}
      {q && (
        <Link
          href={indexHref(action, keep)}
          className="shrink-0 text-ink-muted text-sm hover:text-brand"
        >
          清除
        </Link>
      )}
    </form>
  );
}

export function AdminPagination({
  basePath,
  page,
  total,
  q,
  keep = {},
}: {
  basePath: string;
  page: number;
  total: number;
  q?: string;
  /** Other filters the page links should keep. */
  keep?: Record<string, string | undefined>;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages === 1) return null;
  const href = (p: number) =>
    indexHref(basePath, { ...keep, q, page: p > 1 ? String(p) : undefined });
  return (
    <nav aria-label="分页" className="mt-6 flex items-center gap-4 text-sm">
      {page > 1 ? (
        <Link href={href(page - 1)} className="text-brand hover:underline">
          ← 上一页
        </Link>
      ) : (
        <span className="text-ink-muted">← 上一页</span>
      )}
      <span className="text-ink-muted tabular-nums">
        {page} / {pages}
      </span>
      {page < pages ? (
        <Link href={href(page + 1)} className="text-brand hover:underline">
          下一页 →
        </Link>
      ) : (
        <span className="text-ink-muted">下一页 →</span>
      )}
    </nav>
  );
}

/**
 * Both editions at a glance. The EN badge used to appear only when
 * published, so "zh live, EN still a draft" — the most common to-do —
 * looked identical to "no English at all".
 */
export function StatusBadges({
  status,
  statusEn,
}: {
  status: "draft" | "published";
  statusEn: "draft" | "published";
}) {
  return (
    <span className="flex flex-wrap gap-1.5">
      <Badge variant={status === "published" ? "default" : "secondary"}>
        {status === "published" ? "已发布" : "草稿"}
      </Badge>
      <Badge
        variant="outline"
        className={statusEn === "published" ? undefined : "border-dashed text-ink-muted"}
      >
        {statusEn === "published" ? "EN" : "EN 草稿"}
      </Badge>
    </span>
  );
}

/** Row link that makes the whole table row clickable (the row needs `relative`). */
export const ROW_LINK = "font-medium hover:text-brand after:absolute after:inset-0";
