"use client";

import { useTransition } from "react";
import { addPresetReward } from "./actions";
import { formatCurrency } from "@/lib/currency";
import { Card, FluentEmoji } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

const PRESETS = [
  { name: "Coffee treat", emoji: EMOJI.coffee, price: 700 },
  { name: "New book", emoji: EMOJI.books, price: 1000 },
  { name: "Face mask", emoji: EMOJI.spa, price: 500 },
  { name: "Movie night", emoji: EMOJI.movie, price: 1500 },
];

export function PresetRewards() {
  const [isPending, startTransition] = useTransition();

  function handleAdd(preset: (typeof PRESETS)[number]) {
    startTransition(async () => {
      await addPresetReward(preset.name, preset.emoji, preset.price);
    });
  }

  return (
    <div className="space-y-3">
      <h3 className="heading-section text-neutral-900">Suggestions</h3>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => handleAdd(preset)}
            disabled={isPending}
            className="text-left"
          >
            <Card
              variant="standard"
              interactive
              className="flex items-center gap-2 p-3 disabled:opacity-50"
            >
              <FluentEmoji emoji={preset.emoji} size={20} />
              <div>
                <p className="text-small text-neutral-900">{preset.name}</p>
                <p className="text-tiny text-neutral-700/70">{formatCurrency(preset.price)}</p>
              </div>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}
