"use client";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "@/lib/utils";

function SortableRow({
  id,
  index,
  handleLabel,
  disabled,
  children,
}: {
  id: string;
  index: number;
  handleLabel: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const { ref, handleRef, isDragging } = useSortable({ id, index, disabled });
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-start gap-2 border border-line bg-card p-3",
        isDragging && "opacity-60",
      )}
    >
      <button
        ref={handleRef}
        type="button"
        title={handleLabel}
        aria-label={handleLabel}
        disabled={disabled}
        className="mt-1 cursor-grab select-none text-ink-muted hover:text-brand disabled:cursor-wait disabled:opacity-50"
      >
        ⠿
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * Generic drag-to-reorder list (dnd-kit), shared by the admin panels and
 * the public user-list owner panel — which loads it lazily, so viewers
 * never download dnd-kit. The parent owns the item array and persists
 * the new order in `onReorder` (a server action call); `disabled` holds
 * the list still while that save is in flight, so a second drag can't
 * start from an order that is about to be rolled back.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  handleLabel,
  disabled = false,
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Accessible name of each row's drag handle, in the page's language. */
  handleLabel: string;
  disabled?: boolean;
}) {
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        const next = move(items, event);
        if (next !== items) onReorder(next);
      }}
    >
      <div className="flex flex-col gap-2">
        {items.map((item, index) => (
          <SortableRow
            key={item.id}
            id={item.id}
            index={index}
            handleLabel={handleLabel}
            disabled={disabled}
          >
            {renderItem(item, index)}
          </SortableRow>
        ))}
      </div>
    </DragDropProvider>
  );
}
