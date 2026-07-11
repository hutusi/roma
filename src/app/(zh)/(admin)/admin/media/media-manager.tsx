"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteMedia, updateMedia, uploadMedia } from "@/actions/media";
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
  directorId: string | null;
};

export function MediaManager({
  rows,
  films,
  directors,
  activeFilmId,
}: {
  rows: MediaRow[];
  films: { id: string; title: string }[];
  directors: { id: string; name: string }[];
  activeFilmId: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mt-6 space-y-8">
      <form
        ref={formRef}
        className="grid max-w-3xl grid-cols-2 gap-3 border border-line bg-card p-4"
        onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          setUploading(true);
          const result = await uploadMedia(formData);
          setUploading(false);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("已上传");
          formRef.current?.reset();
          router.refresh();
        }}
      >
        <div className="col-span-2 space-y-1.5">
          <Label htmlFor="file">图片文件（JPEG/PNG/WebP/AVIF，≤4MB）</Label>
          <Input id="file" name="file" type="file" accept="image/*" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="kind">类型</Label>
          <select
            id="kind"
            name="kind"
            className="h-9 w-full border border-input bg-transparent px-2 text-sm"
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
            className="h-9 w-full border border-input bg-transparent px-2 text-sm"
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
          <Label htmlFor="directorId">关联导演</Label>
          <select
            id="directorId"
            name="directorId"
            className="h-9 w-full border border-input bg-transparent px-2 text-sm"
            defaultValue=""
          >
            <option value="">（不关联）</option>
            {directors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <Button type="submit" disabled={uploading}>
            {uploading ? "上传中…" : "上传"}
          </Button>
        </div>
      </form>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((m) => (
          <div key={m.id} className="border border-line bg-card">
            <div className="relative aspect-[137/100] bg-ink">
              <Image
                src={m.url}
                alt={m.alt}
                fill
                sizes="(min-width: 1280px) 25vw, 50vw"
                className="object-contain"
              />
            </div>
            <div className="space-y-2 p-3 text-sm">
              <div className="flex gap-2">
                <select
                  className="h-8 flex-1 border border-input bg-transparent px-1 text-xs"
                  defaultValue={m.kind}
                  onChange={(e) =>
                    startTransition(async () => {
                      const result = await updateMedia(m.id, { kind: e.target.value });
                      if (!result.ok) toast.error(result.error);
                    })
                  }
                >
                  {KINDS.map((k) => (
                    <option key={k.value} value={k.value}>
                      {k.label}
                    </option>
                  ))}
                </select>
                <select
                  className="h-8 flex-1 border border-input bg-transparent px-1 text-xs"
                  defaultValue={m.filmId ?? ""}
                  onChange={(e) =>
                    startTransition(async () => {
                      const result = await updateMedia(m.id, {
                        filmId: e.target.value || null,
                      });
                      if (!result.ok) toast.error(result.error);
                    })
                  }
                >
                  <option value="">（无影片）</option>
                  {films.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                defaultValue={m.credit}
                placeholder="图片来源 *"
                className="h-8 text-xs"
                onBlur={(e) => {
                  if (e.target.value === m.credit) return;
                  startTransition(async () => {
                    const result = await updateMedia(m.id, { credit: e.target.value });
                    if (!result.ok) toast.error(result.error);
                    else toast.success("来源已更新");
                  });
                }}
              />
              <Input
                defaultValue={m.alt}
                placeholder="替代文本"
                className="h-8 text-xs"
                onBlur={(e) => {
                  if (e.target.value === m.alt) return;
                  startTransition(async () => {
                    const result = await updateMedia(m.id, { alt: e.target.value });
                    if (!result.ok) toast.error(result.error);
                  });
                }}
              />
              <button
                type="button"
                disabled={pending}
                className="text-ink-muted text-xs hover:text-destructive"
                onClick={() => {
                  if (!window.confirm("删除这张图片？文件也会被移除。")) return;
                  startTransition(async () => {
                    const result = await deleteMedia(m.id);
                    if (!result.ok) {
                      toast.error(result.error);
                      return;
                    }
                    router.refresh();
                  });
                }}
              >
                删除
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="col-span-full text-ink-muted text-sm">媒体库为空。</p>}
      </div>
    </div>
  );
}
