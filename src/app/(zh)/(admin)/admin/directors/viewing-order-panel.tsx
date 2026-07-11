"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { setViewingOrder } from "@/actions/directors";
import { SortableList } from "@/components/admin/sortable-list";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ViewingItem = {
  id: string;
  filmId: string;
  title: string;
  year: number;
  note: string;
};

export type FilmOption = { id: string; title: string; year: number };

/**
 * The whole panel edits locally, then persists the full order in one
 * action call — reordering, notes, adds and removes all land together.
 */
export function ViewingOrderPanel({
  directorId,
  initialItems,
  filmOptions,
}: {
  directorId: string;
  initialItems: ViewingItem[];
  filmOptions: FilmOption[];
}) {
  const [items, setItems] = useState(initialItems);
  const [selectedFilm, setSelectedFilm] = useState("");
  const [pending, startTransition] = useTransition();
  const [dirty, setDirty] = useState(false);

  const update = (next: ViewingItem[]) => {
    setItems(next);
    setDirty(true);
  };

  const available = filmOptions.filter((f) => !items.some((item) => item.filmId === f.id));

  const save = () =>
    startTransition(async () => {
      const result = await setViewingOrder(
        directorId,
        items.map(({ filmId, note }) => ({ filmId, note: note || undefined })),
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("观看顺序已保存");
      setDirty(false);
    });

  return (
    <section className="mt-10 max-w-3xl border-line border-t pt-6">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">建议观看顺序</h2>
        <Button size="sm" onClick={save} disabled={pending || !dirty}>
          {pending ? "保存中…" : dirty ? "保存顺序" : "已保存"}
        </Button>
      </div>

      <div className="mt-4 flex gap-2">
        <select
          className="h-9 flex-1 border border-input bg-transparent px-2 text-sm"
          value={selectedFilm}
          onChange={(e) => setSelectedFilm(e.target.value)}
        >
          <option value="">选择要加入的影片…</option>
          {available.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}（{f.year}）
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="outline"
          disabled={!selectedFilm}
          onClick={() => {
            const film = filmOptions.find((f) => f.id === selectedFilm);
            if (!film) return;
            update([
              ...items,
              {
                id: film.id,
                filmId: film.id,
                title: film.title,
                year: film.year,
                note: "",
              },
            ]);
            setSelectedFilm("");
          }}
        >
          加入
        </Button>
      </div>

      <div className="mt-4">
        <SortableList
          items={items}
          onReorder={update}
          renderItem={(item, index) => (
            <div className="flex items-center gap-3">
              <span className="w-6 text-right font-display text-ink-muted">{index + 1}</span>
              <span className="shrink-0">
                {item.title}
                <span className="ml-1 text-ink-muted text-xs">{item.year}</span>
              </span>
              <Input
                placeholder="备注（为什么排在这里）"
                value={item.note}
                onChange={(e) =>
                  update(
                    items.map((it) => (it.id === item.id ? { ...it, note: e.target.value } : it)),
                  )
                }
                className="h-8 flex-1"
              />
              <button
                type="button"
                className="text-ink-muted text-sm hover:text-destructive"
                onClick={() => update(items.filter((it) => it.id !== item.id))}
              >
                移除
              </button>
            </div>
          )}
        />
        {items.length === 0 && (
          <p className="mt-2 text-ink-muted text-sm">还没有影片——从上方加入并拖动排序。</p>
        )}
      </div>
    </section>
  );
}
