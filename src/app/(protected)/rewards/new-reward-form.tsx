"use client";

import { useActionState, useState } from "react";
import { createReward, type RewardActionState } from "./actions";

const initialState: RewardActionState = { error: null };

const EMOJI_OPTIONS = ["☕", "📚", "🧖", "🎬", "🍰", "🎵", "🎮", "🌸"];

export function NewRewardForm() {
  const [state, formAction, isPending] = useActionState(createReward, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState("🎁");

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-400 hover:border-primary hover:text-primary-dark"
      >
        + Add custom reward
      </button>
    );
  }

  return (
    <form action={formAction} className="space-y-3 rounded-2xl border-2 border-gray-200 bg-white p-4">
      {state.error && (
        <div className="rounded-xl bg-red-50 p-2 text-xs text-red-700">{state.error}</div>
      )}

      <div className="flex gap-2">
        {EMOJI_OPTIONS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setSelectedEmoji(e)}
            className={`rounded-lg p-1.5 text-lg transition-colors ${
              selectedEmoji === e ? "bg-primary/20" : "hover:bg-gray-100"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      <input type="hidden" name="emoji" value={selectedEmoji} />

      <input
        name="name"
        type="text"
        required
        placeholder="Reward name"
        className="block w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
      />

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">$</span>
        <input
          name="price"
          type="number"
          step="0.01"
          min="1"
          required
          placeholder="7.00"
          className="block w-24 rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {isPending ? "Adding..." : "Add Reward"}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
