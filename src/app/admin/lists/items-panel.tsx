"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  addFilmToList,
  removeListItem,
  reorderListItems,
  updateItemReasoning,
} from "@/actions/lists";
import { callAction, notifyActionError } from "@/components/admin/action-client";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { useDirtyGuard } from "@/components/admin/dirty-guard";
import { SortableList } from "@/components/list/sortable-list";
import { TiptapEditor } from "@/components/tiptap/editor";
import { Button } from "@/components/ui/button";

export type ListItem = {
  id: string;
  filmId: string;
  title: string;
  year: number;
  reasoning: Record<string, unknown> | null;
  reasoningEn: Record<string, unknown> | null;
};

export type FilmOption = { id: string; title: string; year: number };

/**
 * Items reorder optimistically and persist immediately; each row expands
 * to a Tiptap editor for the per-film reasoning (saved per row).
 */
export function ItemsPanel({
  listId,
  initialItems,
  filmOptions,
}: {
  listId: string;
  initialItems: ListItem[];
  filmOptions: FilmOption[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [selectedFilm, setSelectedFilm] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Record<string, unknown>>>({});
  const [draftsEn, setDraftsEn] = useState<Record<string, Record<string, unknown>>>({});
  useDirtyGuard("list-reasoning", Object.keys(drafts).length + Object.keys(draftsEn).length > 0);
  const [pending, startTransition] = useTransition();

  // router.refresh() re-renders the server parent with fresh
  // initialItems, but useState only seeds on mount — adopt the new
  // server truth (e.g. a film just added) whenever the prop changes.
  // State-during-render reset, per React docs (not an effect).
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);
  if (prevInitialItems !== initialItems) {
    setPrevInitialItems(initialItems);
    setItems(initialItems);
  }

  const available = filmOptions.filter((f) => !items.some((item) => item.filmId === f.id));

  return (
    <section className="mt-10 max-w-3xl border-line border-t pt-6">
      <h2 className="font-bold">片单条目（拖动排序，点击展开写入选理由）</h2>

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
          disabled={!selectedFilm || pending}
          onClick={() =>
            startTransition(async () => {
              const result = await callAction(() => addFilmToList(listId, selectedFilm));
              if (!result.ok) {
                notifyActionError(result.error);
                return;
              }
              setSelectedFilm("");
              router.refresh();
              toast.success("已加入");
            })
          }
        >
          加入
        </Button>
      </div>

      <div className="mt-4">
        <SortableList
          items={items}
          handleLabel="拖动排序"
          onReorder={(next) => {
            const previous = items;
            setItems(next);
            startTransition(async () => {
              const result = await callAction(() =>
                reorderListItems(
                  listId,
                  next.map((item) => item.id),
                ),
              );
              if (!result.ok) {
                setItems(previous);
                notifyActionError(result.error);
              }
            });
          }}
          renderItem={(item, index) => (
            <div>
              {/* biome-ignore lint/a11y/useSemanticElements: a real <button> would nest the interactive 移除 button inside it — invalid HTML; this div carries full keyboard handling instead. */}
              <div
                role="button"
                tabIndex={0}
                className="flex w-full cursor-pointer items-center gap-3 text-left"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setExpanded(expanded === item.id ? null : item.id);
                  }
                }}
              >
                <span className="w-6 text-right font-display text-ink-muted">{index + 1}</span>
                <span className="flex-1">
                  {item.title}
                  <span className="ml-1 text-ink-muted text-xs">{item.year}</span>
                </span>
                <span className="text-ink-muted text-xs">
                  {item.reasoning || drafts[item.id] ? "已有理由" : "缺入选理由"}
                  {expanded === item.id ? " ▲" : " ▼"}
                </span>
                {/* The row toggles its editor on click; keep this out of it. */}
                {/* biome-ignore lint/a11y/noStaticElementInteractions: only stops the bubble into the clickable row; the button inside is the control. */}
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: as above — keyboard activation happens on the button. */}
                <span onClick={(e) => e.stopPropagation()}>
                  <ConfirmButton
                    size="sm"
                    variant="ghost"
                    className="text-ink-muted hover:text-destructive"
                    title="移出片单？"
                    description={`《${item.title}》和它的入选理由会从这份片单里移除。`}
                    confirmLabel="移出"
                    onConfirm={() =>
                      startTransition(async () => {
                        const result = await callAction(() => removeListItem(item.id));
                        if (!result.ok) {
                          notifyActionError(result.error);
                          return;
                        }
                        setItems(items.filter((it) => it.id !== item.id));
                        toast.success("已移出片单");
                      })
                    }
                  >
                    移除
                  </ConfirmButton>
                </span>
              </div>
              {expanded === item.id && (
                <div className="mt-3 space-y-2">
                  <TiptapEditor
                    value={drafts[item.id] ?? item.reasoning}
                    onChange={(doc) => setDrafts((d) => ({ ...d, [item.id]: doc }))}
                    placeholder="这部影片为什么在这份片单里，为什么在这个位置…"
                    aria-label="入选理由"
                  />
                  <Button
                    size="sm"
                    disabled={pending || !drafts[item.id]}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await callAction(() =>
                          updateItemReasoning(item.id, drafts[item.id]),
                        );
                        if (!result.ok) {
                          notifyActionError(result.error);
                          return;
                        }
                        setItems(
                          items.map((it) =>
                            it.id === item.id ? { ...it, reasoning: drafts[item.id] } : it,
                          ),
                        );
                        // Saved: the draft is the record now, so it stops
                        // counting as unsaved (and the button settles).
                        setDrafts(({ [item.id]: _saved, ...rest }) => rest);
                        toast.success("入选理由已保存");
                      })
                    }
                  >
                    保存理由
                  </Button>
                  <p className="pt-2 text-ink-muted text-xs">英文入选理由 · Reasoning (EN)</p>
                  <TiptapEditor
                    value={draftsEn[item.id] ?? item.reasoningEn}
                    onChange={(doc) => setDraftsEn((d) => ({ ...d, [item.id]: doc }))}
                    placeholder="Why this film belongs here, in this position…"
                    aria-label="英文入选理由"
                    lang="en"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending || !draftsEn[item.id]}
                    onClick={() =>
                      startTransition(async () => {
                        const result = await callAction(() =>
                          updateItemReasoning(item.id, draftsEn[item.id], "en"),
                        );
                        if (!result.ok) {
                          notifyActionError(result.error);
                          return;
                        }
                        setItems(
                          items.map((it) =>
                            it.id === item.id ? { ...it, reasoningEn: draftsEn[item.id] } : it,
                          ),
                        );
                        setDraftsEn(({ [item.id]: _saved, ...rest }) => rest);
                        toast.success("英文理由已保存");
                      })
                    }
                  >
                    保存英文理由
                  </Button>
                </div>
              )}
            </div>
          )}
        />
        {items.length === 0 && (
          <p className="mt-2 text-ink-muted text-sm">
            还没有影片。片单的顺序是编辑立场的一部分——想好再排。
          </p>
        )}
      </div>
    </section>
  );
}
