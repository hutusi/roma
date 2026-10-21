"use client";

import { XIcon } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import { Input } from "@/components/ui/input";

export type PickerOption = { id: string; label: string; hint?: string };

/** Below this many options a filter box is clutter, not help. */
const FILTER_FROM = 12;

/**
 * A many-of picker that stays usable as the catalogue grows: the film
 * form's directors were a wall of every person on the site, actors
 * included, with nothing to say which ones were ticked short of reading
 * them all. The choices stay plain checkboxes (keyboard, screen reader
 * and test friendly) inside a bounded, filterable list, and the current
 * selection is summarised above it in pick order — the order directors
 * are credited in — each removable even when filtered out of view.
 */
export function CheckboxPicker({
  options,
  value,
  onChange,
  filterLabel,
  empty,
}: {
  options: PickerOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  /** Names the filter box, e.g. "筛选人物". */
  filterLabel: string;
  /** Shown when there is nothing to pick from at all. */
  empty: ReactNode;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  if (options.length === 0) {
    return <div className="border border-line bg-card p-3 text-ink-muted text-sm">{empty}</div>;
  }

  const byId = new Map(options.map((o) => [o.id, o]));
  const q = query.trim().toLowerCase();
  const shown = q
    ? options.filter((o) => `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(q))
    : options;
  const toggle = (optionId: string, on: boolean) =>
    onChange(on ? [...value, optionId] : value.filter((v) => v !== optionId));

  return (
    <div className="border border-line bg-card">
      {value.length > 0 && (
        <ul aria-label="已选" className="flex flex-wrap gap-1.5 border-line border-b p-2">
          {value.map((selected) => (
            <li
              key={selected}
              className="flex items-center gap-1 rounded-sm bg-accent py-0.5 pr-0.5 pl-2 text-sm"
            >
              {byId.get(selected)?.label ?? "（已删除）"}
              <button
                type="button"
                aria-label={`移除 ${byId.get(selected)?.label ?? ""}`}
                className="rounded-sm p-0.5 text-ink-muted hover:bg-paper hover:text-destructive"
                onClick={() => toggle(selected, false)}
              >
                <XIcon className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {options.length >= FILTER_FROM && (
        <div className="border-line border-b p-2">
          <Input
            id={`${id}-filter`}
            type="search"
            value={query}
            aria-label={filterLabel}
            placeholder={filterLabel}
            className="h-8"
            onChange={(e) => setQuery(e.target.value)}
            // Enter in a filter box must not submit the whole form.
            onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          />
        </div>
      )}
      <div className="flex max-h-56 flex-wrap content-start gap-x-4 gap-y-2 overflow-y-auto p-3">
        {shown.length === 0 && (
          <p className="text-ink-muted text-sm">没有匹配「{query.trim()}」的条目。</p>
        )}
        {shown.map((o) => (
          <label key={o.id} className="flex items-center gap-1.5 text-sm">
            <input
              type="checkbox"
              checked={value.includes(o.id)}
              onChange={(e) => toggle(o.id, e.target.checked)}
            />
            {o.label}
            {o.hint && <span className="text-ink-muted text-xs">{o.hint}</span>}
          </label>
        ))}
      </div>
    </div>
  );
}
