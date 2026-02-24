"use client";

import { useTransition } from "react";
import { saveMoodCheckin } from "./actions";
import { MOODS } from "@/lib/moods";
import { Card, FluentEmoji } from "@/components/ui";

export function MoodCheckin({ hasMoodToday }: { hasMoodToday: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleMood(mood: string) {
    startTransition(() => {
      void saveMoodCheckin(mood);
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
        {MOODS.map((mood) => (
          <button
            key={mood.label}
            onClick={() => handleMood(mood.label.toLowerCase())}
            disabled={isPending}
            className="flex flex-col items-center gap-1 rounded-xl p-2 transition-colors hover:bg-neutral-50 disabled:opacity-50"
          >
            <FluentEmoji emoji={mood.emoji} size={24} />
            <span className="text-tiny text-neutral-700/70">{mood.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}
