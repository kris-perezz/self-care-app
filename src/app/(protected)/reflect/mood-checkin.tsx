"use client";

import { useTransition } from "react";
import { saveMoodCheckin } from "./actions";
import { MOODS } from "@/lib/moods";

export function MoodCheckin({ hasMoodToday }: { hasMoodToday: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleMood(mood: string) {
    startTransition(() => {
      void saveMoodCheckin(mood);
    });
  }

  if (hasMoodToday) {
    return (
      <div
        className="rounded-2xl p-4 text-center"
        style={{ background: "linear-gradient(135deg, #ffe4fa, #ffc4eb)" }}
      >
        <p className="text-sm font-medium text-pink-800">
          Mood logged today ✓
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "linear-gradient(135deg, #ffe4fa, #ffc4eb)" }}
    >
      <p className="mb-3 text-sm font-bold text-pink-900">
        How are you feeling?
      </p>
      <div className="flex justify-around">
        {MOODS.map((mood) => (
          <button
            key={mood.label}
            onClick={() => handleMood(mood.label.toLowerCase())}
            disabled={isPending}
            className="flex flex-col items-center gap-1 rounded-xl p-2 transition-colors hover:bg-white/40 disabled:opacity-50"
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-xs text-pink-800/70">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
