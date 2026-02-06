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
    <div className={cn("relative", className)}>
      <input
        type="date"
        name={name}
        value={value ?? ""}
        onChange={(event) => {
          onChange(event.target.value ? event.target.value : null);
        }}
        className="block w-full rounded-xl border-2 border-neutral-100 bg-neutral-50 px-4 py-2.5 text-body text-neutral-900 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />
    </div>
  );
}
