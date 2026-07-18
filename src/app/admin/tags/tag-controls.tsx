"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteTag, saveTag } from "@/actions/tags";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";

type TagValues = { slug: string; nameZh: string; nameEn: string };

const EMPTY: TagValues = { slug: "", nameZh: "", nameEn: "" };

export function TagCreateForm() {
  const router = useRouter();
  const [values, setValues] = useState(EMPTY);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await saveTag(null, values);
          if (!result.ok) {
            toast.error(result.error);
            return;
          }
          toast.success("标签已创建");
          setValues(EMPTY);
          router.refresh();
        });
      }}
    >
      <Input
        placeholder="slug（如 film-noir）"
        value={values.slug}
        onChange={(e) => setValues({ ...values, slug: e.target.value })}
        required
      />
      <Input
        placeholder="中文名（如 黑色电影）"
        value={values.nameZh}
        onChange={(e) => setValues({ ...values, nameZh: e.target.value })}
        required
      />
      <Input
        placeholder="English name（如 Film Noir）"
        value={values.nameEn}
        onChange={(e) => setValues({ ...values, nameEn: e.target.value })}
        required
      />
      <Button type="submit" disabled={pending}>
        {pending ? "创建中…" : "创建标签"}
      </Button>
    </form>
  );
}

/**
 * Whole row is a client island so the three text cells can flip to
 * inputs in place — the tags table is small enough that shipping it to
 * the client costs nothing.
 */
export function TagRow({ tag, filmCount }: { tag: { id: string } & TagValues; filmCount: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState<TagValues>(tag);
  const [pending, startTransition] = useTransition();

  if (!editing) {
    return (
      <TableRow>
        <TableCell className="font-medium">{tag.slug}</TableCell>
        <TableCell>{tag.nameZh}</TableCell>
        <TableCell>{tag.nameEn}</TableCell>
        <TableCell className="text-ink-muted">{filmCount}</TableCell>
        <TableCell>
          <span className="flex gap-3 text-xs">
            <button
              type="button"
              className="text-brand hover:underline"
              onClick={() => {
                setValues(tag);
                setEditing(true);
              }}
            >
              编辑
            </button>
            <button
              type="button"
              disabled={pending}
              className="text-ink-muted hover:text-destructive"
              onClick={() => {
                if (!window.confirm(`删除标签「${tag.nameZh}」？当前关联 ${filmCount} 部影片。`)) {
                  return;
                }
                startTransition(async () => {
                  const result = await deleteTag(tag.id);
                  if (!result.ok) {
                    toast.error(result.error);
                    return;
                  }
                  toast.success("标签已删除");
                  router.refresh();
                });
              }}
            >
              删除
            </button>
          </span>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>
        <Input
          value={values.slug}
          onChange={(e) => setValues({ ...values, slug: e.target.value })}
        />
      </TableCell>
      <TableCell>
        <Input
          value={values.nameZh}
          onChange={(e) => setValues({ ...values, nameZh: e.target.value })}
        />
      </TableCell>
      <TableCell>
        <Input
          value={values.nameEn}
          onChange={(e) => setValues({ ...values, nameEn: e.target.value })}
        />
      </TableCell>
      <TableCell className="text-ink-muted">{filmCount}</TableCell>
      <TableCell>
        <span className="flex gap-3 text-xs">
          <button
            type="button"
            disabled={pending}
            className="text-brand hover:underline"
            onClick={() =>
              startTransition(async () => {
                const result = await saveTag(tag.id, values);
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                toast.success("标签已保存");
                setEditing(false);
                router.refresh();
              })
            }
          >
            {pending ? "保存中…" : "保存"}
          </button>
          <button
            type="button"
            className="text-ink-muted hover:underline"
            onClick={() => setEditing(false)}
          >
            取消
          </button>
        </span>
      </TableCell>
    </TableRow>
  );
}
