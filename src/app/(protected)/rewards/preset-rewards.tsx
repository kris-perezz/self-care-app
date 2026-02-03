"use client";

import { useTransition } from "react";
import { addPresetReward } from "./actions";
import { formatCurrency } from "@/lib/currency";

const PRESETS = [
  { name: "Coffee treat", emoji: "☕", price: 700 },
  { name: "New book", emoji: "📚", price: 1000 },
  { name: "Face mask", emoji: "🧖", price: 500 },
  { name: "Movie night", emoji: "🎬", price: 1500 },
];

export function PresetRewards() {
  const [isPending, startTransition] = useTransition();

  function handleAdd(preset: (typeof PRESETS)[number]) {
    startTransition(() => {
      void addPresetReward(preset.name, preset.emoji, preset.price);
    });
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-gray-900">Suggestions</h3>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleAdd(preset)}
            disabled={isPending}
            className="flex items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white p-3 text-left hover:border-primary disabled:opacity-50"
          >
            <span className="text-lg">{preset.emoji}</span>
            <div>
              <p className="text-sm font-medium text-gray-700">{preset.name}</p>
              <p className="text-xs text-gray-400">{formatCurrency(preset.price)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
