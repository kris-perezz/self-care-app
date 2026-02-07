"use client";

import { cn } from "@/lib/utils";

export interface DatePickerProps {
  name: string;
  value: string | null;
  onChange: (value: string | null) => void;
  className?: string;
}

export function DatePicker({ name, value, onChange, className }: DatePickerProps) {
  return (
    <div className={cn("space-y-2 min-w-0", className)}>
      <input
        type="date"
        name={name}
        value={value ?? ""}
        onChange={(event) => {
          onChange(event.target.value ? event.target.value : null);
        }}
        className="block w-full min-w-0 max-w-full rounded-xl border-2 border-neutral-100 bg-neutral-50 px-4 py-2.5 text-body text-neutral-900 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />
      <button
        type="button"
        className="text-tiny text-neutral-700/70 hover:text-neutral-900"
        onClick={() => onChange(null)}
      >
        Clear date
      </button>
    </div>
  );
}
