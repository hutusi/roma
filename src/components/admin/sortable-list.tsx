"use client";

import { move } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { cn } from "@/lib/utils";

function SortableRow({
  id,
  index,
  children,
}: {
  id: string;
  index: number;
  children: React.ReactNode;
}) {
  const { ref, handleRef, isDragging } = useSortable({ id, index });
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
        title="拖动排序"
        className="mt-1 cursor-grab select-none text-ink-muted hover:text-brand"
      >
        ⠿
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

/**
 * Generic drag-to-reorder list. The parent owns the item array and
 * persists the new order in `onReorder` (a server action call).
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: {
  items: T[];
  onReorder: (next: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
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
          <SortableRow key={item.id} id={item.id} index={index}>
            {renderItem(item, index)}
          </SortableRow>
        ))}
      </div>
    </DragDropProvider>
  );
}
