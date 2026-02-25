"use client";

import { useState } from "react";

const DAYS = [
  { label: "Su", value: 0 },
  { label: "Mo", value: 1 },
  { label: "Tu", value: 2 },
  { label: "We", value: 3 },
  { label: "Th", value: 4 },
  { label: "Fr", value: 5 },
  { label: "Sa", value: 6 },
];

export function DayPicker({
  initialDays,
  onHasSelection,
}: {
  initialDays?: number[] | null;
  onHasSelection?: (hasSelection: boolean) => void;
}) {
  const [selected, setSelected] = useState<Set<number>>(
    new Set(initialDays ?? [])
  );

  function toggle(day: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      onHasSelection?.(next.size > 0);
      return next;
    });
  }

  const hiddenValue = selected.size > 0
    ? [...selected].sort((a, b) => a - b).join(",")
    : "";

  return (
    <div>
      <input type="hidden" name="recurring_days" value={hiddenValue} />
      <div className="flex gap-1.5">
        {DAYS.map(({ label, value }) => {
          const isActive = selected.has(value);
          return (
            <button
              key={value}
              type="button"
              onClick={() => toggle(value)}
              className={`interactive-button flex h-11 flex-1 items-center justify-center rounded-full text-tiny transition-colors ${
                isActive
                  ? "bg-primary-500 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
              aria-label={label}
              aria-pressed={isActive}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
