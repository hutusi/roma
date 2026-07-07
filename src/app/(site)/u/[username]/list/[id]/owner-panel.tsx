"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  addFilmToUserList,
  deleteUserList,
  removeUserListItem,
  reorderUserListItems,
  updateUserList,
} from "@/actions/user-lists";
import { SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";

type Item = { id: string; filmId: string; title: string; year: number };

export function OwnerPanel({
  listId,
  username,
  title,
  description,
  filmOptions,
  initialItems,
}: {
  listId: string;
  username: string;
  title: string;
  description: string;
  filmOptions: { id: string; title: string; year: number }[];
  initialItems: Item[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selectedFilm, setSelectedFilm] = useState("");
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  // Adopt fresh server data after router.refresh() (e.g. a film just
  // added) — useState alone only seeds on mount. State-during-render
  // reset, per React docs (not an effect).
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);
  if (prevInitialItems !== initialItems) {
    setPrevInitialItems(initialItems);
    setItems(initialItems);
  }

  const available = filmOptions.filter((f) => !items.some((item) => item.filmId === f.id));

  return (
    <section className="mt-8 border border-line bg-card p-4 font-sans text-[15px]">
      <div className="flex items-center justify-between">
        <p className="text-ink-muted text-sm">这是你的片单</p>
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            className="text-brand hover:underline"
            onClick={() => setEditing(!editing)}
          >
            {editing ? "收起" : "编辑标题"}
          </button>
          <button
            type="button"
            className="text-ink-muted hover:text-destructive"
            disabled={pending}
            onClick={() => {
              if (!window.confirm("删除这份片单？不可恢复。")) return;
              startTransition(async () => {
                const result = await deleteUserList(listId);
                if (!result.ok) {
                  toast.error(result.error);
                  return;
                }
                router.push(`/u/${username}?tab=lists`);
                router.refresh();
              });
            }}
          >
            删除片单
          </button>
        </div>
      </div>

      {editing && (
        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            startTransition(async () => {
              const result = await updateUserList(listId, {
                title: String(form.get("title")),
                description: String(form.get("description") || ""),
              });
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              setEditing(false);
              router.refresh();
            });
          }}
        >
          <Input name="title" defaultValue={title} required maxLength={60} />
          <Input name="description" defaultValue={description} placeholder="简介" maxLength={140} />
          <Button type="submit" size="sm" disabled={pending}>
            保存
          </Button>
        </form>
      )}

      <div className="mt-3 flex gap-2">
        <select
          className="h-9 flex-1 border border-input bg-transparent px-2 text-sm"
          value={selectedFilm}
          onChange={(e) => setSelectedFilm(e.target.value)}
        >
          <option value="">加入影片…</option>
          {available.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}（{f.year}）
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9"
          disabled={!selectedFilm || pending}
          onClick={() =>
            startTransition(async () => {
              const result = await addFilmToUserList(listId, selectedFilm);
              if (!result.ok) {
                toast.error(result.error);
                return;
              }
              setSelectedFilm("");
              router.refresh();
            })
          }
        >
          加入
        </Button>
      </div>

      {items.length > 1 && (
        <div className="mt-4">
          <p className="mb-2 text-ink-muted text-xs">拖动排序（自动保存）：</p>
          <SortableList
            items={items}
            onReorder={(next) => {
              const previous = items;
              setItems(next);
              startTransition(async () => {
                const result = await reorderUserListItems(
                  listId,
                  next.map((item) => item.id),
                );
                if (!result.ok) {
                  setItems(previous);
                  toast.error(result.error);
                  return;
                }
                router.refresh();
              });
            }}
            renderItem={(item, index) => (
              <div className="flex items-center gap-2">
                <span className="w-5 text-right font-display text-ink-muted">{index + 1}</span>
                <span className="flex-1">
                  {item.title}
                  <span className="ml-1 text-ink-muted text-xs">{item.year}</span>
                </span>
                <button
                  type="button"
                  className="text-ink-muted text-xs hover:text-destructive"
                  onClick={() =>
                    startTransition(async () => {
                      const result = await removeUserListItem(listId, item.id);
                      if (!result.ok) {
                        toast.error(result.error);
                        return;
                      }
                      setItems(items.filter((it) => it.id !== item.id));
                      router.refresh();
                    })
                  }
                >
                  移除
                </button>
              </div>
            )}
          />
        </div>
      )}
      <Toaster position="top-center" />
    </section>
  );
}
