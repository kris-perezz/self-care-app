"use client";

import { formatCurrency } from "@/lib/currency";
import type { Goal } from "@/types";

const DIFFICULTY_COLORS = {
  easy: "bg-primary-100 text-primary-700",
  medium: "bg-secondary-100 text-secondary-900",
  hard: "bg-accent-100 text-accent-900",
} as const;

export function GoalHistoryCard({ goal }: { goal: Goal }) {
  const completedDate = goal.completed_at
    ? new Date(goal.completed_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <div className="flex items-start gap-3 rounded-2xl border-2 border-neutral-100 bg-white p-4 shadow-card">
      {/* Emoji - LEFT */}
      <div className="shrink-0 text-2xl" role="img" aria-label={goal.title}>
        {goal.emoji || "🎯"}
      </div>

      {/* Content - MIDDLE */}
      <div className="min-w-0 flex-1">
        <p className="text-small text-neutral-900">{goal.title}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span
            className={`rounded-xl px-2 py-0.5 text-tiny ${DIFFICULTY_COLORS[goal.difficulty]}`}
          >
            {goal.difficulty.toUpperCase()}
          </span>
          <span className="text-tiny text-neutral-500">{completedDate}</span>
        </div>
      </div>

      {/* Earned amount - RIGHT */}
      <div className="ml-auto shrink-0 text-small font-medium text-primary-700">
        +{formatCurrency(goal.currency_reward)}
      </div>
    </div>
  );
}
