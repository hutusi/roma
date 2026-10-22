"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteMedia, updateMedia, uploadMedia } from "@/actions/media";
import { callAction, notifyActionError } from "@/components/admin/action-client";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const KINDS = [
  { value: "poster", label: "海报" },
  { value: "still", label: "剧照" },
  { value: "hero", label: "题图" },
  { value: "portrait", label: "肖像" },
  { value: "other", label: "其他" },
] as const;

export type MediaRow = {
  id: string;
  url: string;
  alt: string;
  credit: string;
  kind: string;
  filmId: string | null;
  personId: string | null;
};

type Option = { id: string; name: string };
const SELECT = "h-8 w-full min-w-0 border border-line-strong bg-transparent px-1 text-xs";

export function MediaManager({
  rows,
  films,
  people,
  activeFilmId,
  filtered,
}: {
  rows: MediaRow[];
  films: { id: string; title: string }[];
  people: Option[];
  activeFilmId: string | null;
  /** A film filter or search is on, so "empty" means "no matches". */
  filtered: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);

  return (
    <div className="mt-6 space-y-8">
      <form
        ref={formRef}
        className="grid max-w-3xl gap-3 border border-line bg-card p-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          setUploading(true);
          let result: Awaited<ReturnType<typeof uploadMedia>>;
          try {
            result = await callAction(() => uploadMedia(formData));
          } catch {
            // A thrown upload (network drop, aborted request) would otherwise
            // bubble up as an unhandled rejection with no feedback.
            toast.error("上传失败，请重试");
            return;
          } finally {
            // Always release the button — otherwise it sticks on "上传中…".
            setUploading(false);
          }
          if (!result.ok) {
            notifyActionError(result.error);
            return;
          }
          toast.success("已上传");
          formRef.current?.reset();
          router.refresh();
        }}
      >
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="file">图片文件（JPEG/PNG/WebP/AVIF，≤4MB）</Label>
          <Input id="file" name="file" type="file" accept="image/*" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kind">类型</Label>
          <select
            id="kind"
            name="kind"
            className="h-9 w-full border border-line-strong bg-transparent px-2 text-sm"
            defaultValue="still"
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="credit">图片来源 *（版权信息，必填）</Label>
          <Input id="credit" name="credit" placeholder="Criterion / Wikimedia Commons…" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="alt">替代文本</Label>
          <Input id="alt" name="alt" placeholder="画面内容描述" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="filmId">关联影片</Label>
          <select
            id="filmId"
            name="filmId"
            className="h-9 w-full border border-line-strong bg-transparent px-2 text-sm"
            defaultValue={activeFilmId ?? ""}
          >
            <option value="">（不关联）</option>
            {films.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="personId">关联人物</Label>
          <select
            id="personId"
            name="personId"
            className="h-9 w-full border border-line-strong bg-transparent px-2 text-sm"
            defaultValue=""
          >
            <option value="">（不关联）</option>
            {people.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={uploading}>
            {uploading ? "上传中…" : "上传"}
          </Button>
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((m) => (
          <MediaCard
            key={m.id}
            row={m}
            films={films}
            people={people}
            // Re-linking a card away from the film being shown drops it from view.
            onDetached={activeFilmId ? () => router.refresh() : undefined}
            activeFilmId={activeFilmId}
          />
        ))}
        {rows.length === 0 && (
          <p className="col-span-full py-8 text-center text-ink-muted text-sm">
            {filtered ? "没有符合条件的图片。" : "媒体库为空——用上面的表单上传第一张。"}
          </p>
        )}
      </div>
    </div>
  );
}

type Links = { kind: string; filmId: string; personId: string };

/**
 * One library image. Its selects are controlled and save on change with
 * the change shown at once, rolled back if the save fails — they used to
 * be uncontrolled, so a refused change kept displaying the value that
 * wasn't saved. Each card has its own pending state; one shared
 * transition used to disable every card's buttons while any one saved.
 */
function MediaCard({
  row,
  films,
  people,
  activeFilmId,
  onDetached,
}: {
  row: MediaRow;
  films: { id: string; title: string }[];
  people: Option[];
  activeFilmId: string | null;
  onDetached?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [links, setLinks] = useState<Links>({
    kind: row.kind,
    filmId: row.filmId ?? "",
    personId: row.personId ?? "",
  });
  // The last values the server accepted, for blur-saves to compare against.
  const saved = useRef({ credit: row.credit, alt: row.alt });

  const relink = (field: keyof Links, value: string) => {
    const before = links;
    setLinks({ ...links, [field]: value });
    startTransition(async () => {
      const result = await callAction(() =>
        updateMedia(row.id, field === "kind" ? { kind: value } : { [field]: value || null }),
      );
      if (!result.ok) {
        setLinks(before);
        notifyActionError(result.error);
        return;
      }
      toast.success("已更新");
      if (field === "filmId" && activeFilmId && value !== activeFilmId) onDetached?.();
    });
  };

  const saveText = (field: "credit" | "alt", value: string) => {
    if (value === saved.current[field]) return;
    startTransition(async () => {
      const result = await callAction(() => updateMedia(row.id, { [field]: value }));
      if (!result.ok) {
        // Keep the typed text so it can be corrected; it stays unsaved.
        notifyActionError(result.error);
        return;
      }
      saved.current[field] = value;
      toast.success(field === "credit" ? "来源已更新" : "替代文本已更新");
    });
  };

  return (
    <article
      aria-label={row.alt || row.credit}
      aria-busy={pending || undefined}
      className="border border-line bg-card"
    >
      <div className="relative aspect-[137/100] bg-ink">
        <Image
          src={row.url}
          alt={row.alt}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
          className={pending ? "object-contain opacity-60" : "object-contain"}
        />
      </div>
      <div className="space-y-2 p-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <select
            aria-label="类型"
            className={SELECT}
            value={links.kind}
            disabled={pending}
            onChange={(e) => relink("kind", e.target.value)}
          >
            {KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
          <select
            aria-label="关联影片"
            className={SELECT}
            value={links.filmId}
            disabled={pending}
            onChange={(e) => relink("filmId", e.target.value)}
          >
            <option value="">（无影片）</option>
            {films.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
          <select
            aria-label="关联人物"
            className={`${SELECT} col-span-2`}
            value={links.personId}
            disabled={pending}
            onChange={(e) => relink("personId", e.target.value)}
          >
            <option value="">（无人物）</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <Input
          defaultValue={row.credit}
          aria-label="图片来源"
          placeholder="图片来源 *"
          className="h-8 text-xs"
          onBlur={(e) => saveText("credit", e.target.value)}
        />
        <Input
          defaultValue={row.alt}
          aria-label="替代文本"
          placeholder="替代文本"
          className="h-8 text-xs"
          onBlur={(e) => saveText("alt", e.target.value)}
        />
        <ConfirmButton
          size="xs"
          variant="ghost"
          disabled={pending}
          className="text-ink-muted hover:text-destructive"
          title="删除这张图片？"
          description="文件会从存储中移除；用到它的页面将不再显示它。"
          confirmLabel="删除"
          onConfirm={() =>
            startTransition(async () => {
              const result = await callAction(() => deleteMedia(row.id));
              if (!result.ok) {
                notifyActionError(result.error);
                return;
              }
              toast.success("图片已删除");
              router.refresh();
            })
          }
        >
          删除
        </ConfirmButton>
      </div>
    </article>
  );
}
