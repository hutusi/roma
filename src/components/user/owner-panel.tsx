"use client";

import { useRouter } from "next/navigation";
import { lazy, Suspense, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  addFilmToUserList,
  deleteUserList,
  removeUserListItem,
  reorderUserListItems,
  updateUserList,
} from "@/actions/user-lists";
import { invalidateMe } from "@/components/site/use-me";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Dictionary } from "@/i18n/dictionaries/zh";
import { type Locale, localePath } from "@/i18n/locales";

/**
 * `unavailable` = the film is no longer published. The owner still gets
 * the row (they must be able to remove it, and the reorder payload has to
 * stay a complete permutation), but not the film's title.
 */
type Item = { id: string; filmId: string; title: string; year: number; unavailable?: boolean };

// dnd-kit is only for the owner: loaded here, never in the page bundle
// every viewer of a user list downloads. Rows render statically (minus
// the drag handle) until it arrives.
const SortableList = lazy(() =>
  import("@/components/list/sortable-list").then((m) => ({ default: m.SortableList<Item> })),
);

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
  const msg = (code: string) => {
    // The header still shows the reader as signed in; let it catch up.
    if (code === "sessionExpired") invalidateMe();
    return labels.errors[code as keyof typeof labels.errors] ?? labels.errors.unknown;
  };
  const [items, setItems] = useState(initialItems);
  const [selectedFilm, setSelectedFilm] = useState("");
  const [editing, setEditing] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);
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

  /** Runs an action; a thrown one (network, server crash) toasts instead of blanking the page. */
  const run = (action: () => Promise<{ ok: true } | { ok: false; error: string }>) =>
    action().catch(() => ({ ok: false as const, error: "unknown" }));

  const remove = (item: Item) => {
    setRemoving(item.id);
    startTransition(async () => {
      const result = await run(() => removeUserListItem(listId, item.id));
      setRemoving(null);
      if (!result.ok) {
        toast.error(msg(result.error));
        return;
      }
      setItems((current) => current.filter((it) => it.id !== item.id));
      toast.success(labels.removed);
      router.refresh();
    });
  };

  const row = (item: Item, index: number) => (
    <div className="flex items-center gap-2">
      <span className="w-5 text-right font-display text-ink-muted">{index + 1}</span>
      <span className="min-w-0 flex-1">
        {item.unavailable ? (
          <span className="text-ink-muted italic">{labels.unavailable}</span>
        ) : (
          <>
            {item.title}
            <span className="ml-1 text-ink-muted text-xs">{item.year}</span>
          </>
        )}
      </span>
      <button
        type="button"
        className="text-ink-muted text-xs hover:text-destructive disabled:opacity-50"
        disabled={removing !== null}
        aria-busy={removing === item.id}
        onClick={() => remove(item)}
      >
        {removing === item.id ? "…" : labels.remove}
      </button>
    </div>
  );

  return (
    <section className="mt-8 border border-line bg-card p-4 font-sans text-ui">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-ink-muted text-sm">{labels.ownedHint}</p>
        <div className="flex gap-3 text-sm">
          <button
            type="button"
            className="text-brand hover:underline"
            aria-expanded={editing}
            onClick={() => setEditing(!editing)}
          >
            {editing ? labels.collapse : labels.editTitle}
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="text-ink-muted hover:text-destructive"
                disabled={pending}
              >
                {labels.deleteList}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{labels.deleteList}</AlertDialogTitle>
                <AlertDialogDescription>{labels.deleteConfirm}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{labels.cancel}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    startTransition(async () => {
                      const result = await run(() => deleteUserList(listId));
                      if (!result.ok) {
                        toast.error(msg(result.error));
                        return;
                      }
                      router.push(localePath(locale, `/u/${username}?tab=lists`));
                      router.refresh();
                    })
                  }
                >
                  {labels.deleteList}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {editing && (
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            startTransition(async () => {
              const result = await run(() =>
                updateUserList(listId, {
                  title: String(form.get("title")),
                  description: String(form.get("description") || ""),
                }),
              );
              if (!result.ok) {
                toast.error(msg(result.error));
                return;
              }
              setEditing(false);
              toast.success(labels.saved);
              router.refresh();
            });
          }}
        >
          <Input
            name="title"
            aria-label={labels.titleLabel}
            placeholder={labels.titleLabel}
            defaultValue={title}
            required
            maxLength={60}
          />
          <Input
            name="description"
            aria-label={labels.introLabel}
            defaultValue={description}
            placeholder={labels.introPlaceholder}
            maxLength={140}
          />
          <Button type="submit" size="sm" className="h-9" disabled={pending}>
            {labels.save}
          </Button>
        </form>
      )}

      <div className="mt-3 flex gap-2">
        <select
          className="h-9 min-w-0 flex-1 border border-input bg-transparent px-2 text-sm"
          aria-label={labels.addFilm}
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
              const result = await run(() => addFilmToUserList(listId, selectedFilm));
              if (!result.ok) {
                toast.error(msg(result.error));
                return;
              }
              setSelectedFilm("");
              toast.success(labels.added);
              router.refresh();
            })
          }
        >
          {labels.add}
        </Button>
      </div>

      {/* Every row stays removable — including the last one. */}
      {items.length > 0 && (
        <div className="mt-4">
          {items.length > 1 && <p className="mb-2 text-ink-muted text-xs">{labels.reorderHint}</p>}
          <Suspense
            fallback={
              <div className="flex flex-col gap-2">
                {items.map((item, index) => (
                  <div key={item.id} className="border border-line bg-card p-3 pl-8">
                    {row(item, index)}
                  </div>
                ))}
              </div>
            }
          >
            <SortableList
              items={items}
              handleLabel={labels.dragHandle}
              disabled={pending}
              onReorder={(next) => {
                const previous = items;
                setItems(next);
                startTransition(async () => {
                  const result = await run(() =>
                    reorderUserListItems(
                      listId,
                      next.map((item) => item.id),
                    ),
                  );
                  if (!result.ok) {
                    setItems(previous);
                    toast.error(msg(result.error));
                    return;
                  }
                  router.refresh();
                });
              }}
              renderItem={row}
            />
          </Suspense>
        </div>
      )}
    </section>
  );
}
