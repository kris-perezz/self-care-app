"use client";

import { useState, useTransition } from "react";
import { saveMoodCheckin } from "./actions";
import { MOODS } from "@/lib/moods";
import { Card, FluentEmoji } from "@/components/ui";

export function MoodCheckin({ hasMoodToday }: { hasMoodToday: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | null>(null);

  function handleMood(mood: string) {
    setSelected(mood);
    startTransition(async () => {
      await saveMoodCheckin(mood);
    });
  }

  if (hasMoodToday) {
    return (
      <Card variant="tintAccent" className="text-center">
        <p className="text-small text-neutral-900">Mood logged today</p>
      </Card>
    );
  }

  return (
    <Card variant="tintAccent">
      <p className="mb-3 text-small text-neutral-900">How are you feeling?</p>
      <div className="flex justify-around">
        {MOODS.map((mood) => {
          const isSelected = selected === mood.label.toLowerCase();
          const isFaded = selected !== null && !isSelected;
          return (
            <button
              key={mood.label}
              onClick={() => handleMood(mood.label.toLowerCase())}
              disabled={isPending}
              className={[
                "flex flex-col items-center gap-1 rounded-xl p-2 transition-all duration-200",
                isSelected ? "ring-2 ring-accent-400" : "",
                isFaded ? "scale-90 opacity-40" : "",
                !selected ? "hover:bg-neutral-50" : "",
                isPending ? "cursor-not-allowed" : "",
              ].join(" ")}
            >
              <span className={isSelected ? "animate-emoji-bounce" : ""}>
                <FluentEmoji emoji={mood.emoji} size={isSelected ? 32 : 24} />
              </span>
              <span className="text-tiny text-neutral-700/70">{mood.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
