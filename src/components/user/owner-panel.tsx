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
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";

type Item = { id: string; filmId: string; title: string; year: number };

export function OwnerPanel({
  listId,
  username,
  title,
  description,
  filmOptions,
  initialItems,
  locale,
  labels,
}: {
  listId: string;
  username: string;
  title: string;
  description: string;
  filmOptions: { id: string; title: string; year: number }[];
  initialItems: Item[];
  locale: Locale;
  labels: Dictionary["userList"];
}) {
  const router = useRouter();
  const en = locale === "en";
  const msg = (code: string) => labels.errors[code as keyof typeof labels.errors] ?? code;
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
        <p className="text-ink-muted text-sm">{labels.ownedHint}</p>
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            className="text-brand hover:underline"
            onClick={() => setEditing(!editing)}
          >
            {editing ? labels.collapse : labels.editTitle}
          </button>
          <button
            type="button"
            className="text-ink-muted hover:text-destructive"
            disabled={pending}
            onClick={() => {
              if (!window.confirm(labels.deleteConfirm)) return;
              startTransition(async () => {
                const result = await deleteUserList(listId, locale);
                if (!result.ok) {
                  toast.error(msg(result.error));
                  return;
                }
                router.push(localePath(locale, `/u/${username}?tab=lists`));
                router.refresh();
              });
            }}
          >
            {labels.deleteList}
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
              const result = await updateUserList(
                listId,
                {
                  title: String(form.get("title")),
                  description: String(form.get("description") || ""),
                },
                locale,
              );
              if (!result.ok) {
                toast.error(msg(result.error));
                return;
              }
              setEditing(false);
              router.refresh();
            });
          }}
        >
          <Input name="title" defaultValue={title} required maxLength={60} />
          <Input
            name="description"
            defaultValue={description}
            placeholder={labels.introPlaceholder}
            maxLength={140}
          />
          <Button type="submit" size="sm" disabled={pending}>
            {labels.save}
          </Button>
        </form>
      )}

      <div className="mt-3 flex gap-2">
        <select
          className="h-9 flex-1 border border-input bg-transparent px-2 text-sm"
          value={selectedFilm}
          onChange={(e) => setSelectedFilm(e.target.value)}
        >
          <option value="">{labels.addFilm}</option>
          {available.map((f) => (
            <option key={f.id} value={f.id}>
              {en ? `${f.title} (${f.year})` : `${f.title}（${f.year}）`}
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
              const result = await addFilmToUserList(listId, selectedFilm, locale);
              if (!result.ok) {
                toast.error(msg(result.error));
                return;
              }
              setSelectedFilm("");
              router.refresh();
            })
          }
        >
          {labels.add}
        </Button>
      </div>

      {items.length > 1 && (
        <div className="mt-4">
          <p className="mb-2 text-ink-muted text-xs">{labels.reorderHint}</p>
          <SortableList
            items={items}
            onReorder={(next) => {
              const previous = items;
              setItems(next);
              startTransition(async () => {
                const result = await reorderUserListItems(
                  listId,
                  next.map((item) => item.id),
                  locale,
                );
                if (!result.ok) {
                  setItems(previous);
                  toast.error(msg(result.error));
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
                      const result = await removeUserListItem(listId, item.id, locale);
                      if (!result.ok) {
                        toast.error(msg(result.error));
                        return;
                      }
                      setItems(items.filter((it) => it.id !== item.id));
                      router.refresh();
                    })
                  }
                >
                  {labels.remove}
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
