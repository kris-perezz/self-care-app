"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { FluentEmoji } from "./fluent-emoji";

export interface EmojiPickerProps {
  name: string;
  value: string;
  onChange: (emoji: string) => void;
  options: string[];
  className?: string;
}

export function EmojiPicker({
  name,
  value,
  onChange,
  options,
  className,
}: EmojiPickerProps) {
  const id = useId();

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={name}>
        {options.map((emoji, index) => {
          const selected = value === emoji;
          const inputId = `${id}-${index}`;
          return (
            <label
              key={`${emoji}-${index}`}
              htmlFor={inputId}
              className={cn(
                "flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border-2 border-neutral-100 bg-neutral-50 p-2 text-center transition-all duration-150",
                selected
                  ? "border-primary-500 bg-primary-50"
                  : "hover:bg-neutral-100"
              )}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={emoji}
                checked={selected}
                onChange={() => onChange(emoji)}
                className="sr-only"
              />
              <FluentEmoji emoji={emoji} size={24} />
            </label>
          );
        })}
      </div>
    </div>
  );
}
