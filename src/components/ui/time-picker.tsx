"use client";

import { cn } from "@/lib/utils";

export interface TimePickerProps {
  name: string;
  value: string | null;
  onChange: (value: string | null) => void;
  minuteStep?: number;
  className?: string;
}

export function TimePicker({
  name,
  value,
  onChange,
  minuteStep = 5,
  className,
}: TimePickerProps) {
  const safeStep = minuteStep > 0 && minuteStep <= 30 ? minuteStep : 5;
  const step = safeStep * 60;

  return (
    <div className={cn("space-y-2", className)}>
      <input
        type="time"
        name={name}
        value={value ?? ""}
        step={step}
        onChange={(event) => {
          onChange(event.target.value ? event.target.value : null);
        }}
        className="block w-full rounded-xl border-2 border-neutral-100 bg-neutral-50 px-4 py-2.5 text-body text-neutral-900 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />
      <button
        type="button"
        className="text-tiny text-neutral-700/70 hover:text-neutral-900"
        onClick={() => onChange(null)}
      >
        Clear time
      </button>
    </div>
  );
}
