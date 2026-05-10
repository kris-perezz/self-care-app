"use client";

import { useState } from "react";
import { FilterButton } from "@/components/filter-button";
import { GoalCard } from "./goal-card";
import type { Goal } from "@/types";
import { isIntervalGoal, isRecurringGoal } from "@/types";
import { getIsDue } from "@/lib/streak";
import { EmptyState } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

type Filter = "today" | "week" | "all";

export function GoalFilters({
  goals,
  today,
  todayDow,
  timezone,
}: {
  goals: Goal[];
  today: string;
  todayDow: number;
  timezone: string;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const weekEnd = weekFromNow.toLocaleDateString("en-CA");

  function isCompleted(goal: Goal): boolean {
    if (isIntervalGoal(goal)) return false; // interval goals are never permanently done
    if (isRecurringGoal(goal)) return goal.last_completed_date === today;
    return goal.completed_at !== null;
  }

  const filtered = goals.filter((goal) => {
    if (filter === "all") return true;
    if (filter === "today") {
      if (isIntervalGoal(goal)) return getIsDue(goal, timezone);
      if (isRecurringGoal(goal)) return goal.recurring_days.includes(todayDow);
      return goal.scheduled_date === today;
    }
    if (filter === "week") {
      if (isIntervalGoal(goal)) return getIsDue(goal, timezone);
      if (isRecurringGoal(goal)) return true;
      if (!goal.scheduled_date) return false;
      return goal.scheduled_date >= today && goal.scheduled_date <= weekEnd;
    }
    return true;
  });

  function renderEmptyState() {
    if (filter === "today") {
      return (
        <EmptyState
          emoji={EMOJI.sparkles}
          heading="A clear day"
          message="No goals scheduled for today — enjoy the space."
        />
      );
    }
    if (filter === "all") {
      return (
        <EmptyState
          emoji={EMOJI.sparkles}
          heading="All done!"
          message="Every goal is complete. You showed up."
        />
      );
    }
    return (
      <EmptyState
        emoji={EMOJI.sparkles}
        heading="A quiet week"
        message="No goals scheduled for this week."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["today", "week", "all"] as const).map((f) => (
          <FilterButton
            key={f}
            active={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === "today" ? "Today" : f === "week" ? "This week" : "All"}
          </FilterButton>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-3">
          {[...filtered]
            .sort((a, b) => {
              const aDone = isCompleted(a);
              const bDone = isCompleted(b);
              if (aDone === bDone) return 0;
              return aDone ? 1 : -1;
            })
            .map((goal, i) => (
            <GoalCard key={goal.id} goal={goal} today={today} linkToDetails detailsFrom="goals" index={i} />
          ))}
        </div>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
}
