"use client";

import { formatCurrency } from "@/lib/currency";
import type { Goal } from "@/types";

const DIFFICULTY_COLORS = {
  easy: "bg-primary/20 text-primary-dark",
  medium: "bg-tan/60 text-gray-700",
  hard: "bg-pink/30 text-pink-800",
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
    <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-white p-4">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary">
        <svg
          className="h-3.5 w-3.5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={3}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4.5 12.75 6 6 9-13.5"
          />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{goal.title}</p>
        <div className="mt-1 flex items-center gap-2">
          <span
            className={`rounded-xl px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[goal.difficulty]}`}
          >
            {goal.difficulty}
          </span>
          <span className="text-xs text-gray-400">{completedDate}</span>
        </div>
      </div>
      <span className="shrink-0 text-xs font-medium text-primary-dark">
        +{formatCurrency(goal.currency_reward)}
      </span>
    </div>
  );
}
