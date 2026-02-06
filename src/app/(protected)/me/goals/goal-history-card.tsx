"use client";

import { formatCurrency } from "@/lib/currency";
import type { Goal } from "@/types";
import { Badge, Card, FluentEmoji } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

export function GoalHistoryCard({ goal }: { goal: Goal }) {
  const completedDate = goal.completed_at
    ? new Date(goal.completed_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Card variant="standard" className="flex items-start gap-3">
      <div className="shrink-0" role="img" aria-label={goal.title}>
        <FluentEmoji emoji={goal.emoji || EMOJI.target} size={24} label={goal.title} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-small text-neutral-900">{goal.title}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <Badge variant={goal.difficulty}>{goal.difficulty.toUpperCase()}</Badge>
          <span className="text-tiny text-neutral-700/70">{completedDate}</span>
        </div>
      </div>

      <div className="ml-auto shrink-0 text-small font-medium text-neutral-900">
        +{formatCurrency(goal.currency_reward)}
      </div>
    </Card>
  );
}
