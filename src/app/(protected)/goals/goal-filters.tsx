"use client";

import { useState } from "react";
import { FilterButton } from "@/components/filter-button";
import { GoalCard } from "./goal-card";
import type { Goal } from "@/types";
import { EmptyState } from "@/components/ui";

type Filter = "today" | "week" | "all";

export function GoalFilters({
  goals,
  today,
  todayDow,
}: {
  goals: Goal[];
  today: string;
  todayDow: number;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const weekEnd = weekFromNow.toLocaleDateString("en-CA");

  const filtered = goals.filter((goal) => {
    if (filter === "all") return true;
    if (filter === "today") {
      if (goal.recurring_days) return goal.recurring_days.includes(todayDow);
      return goal.scheduled_date === today;
    }
    if (filter === "week") {
      if (goal.recurring_days) return true; // recurring goals are always relevant this week
      if (!goal.scheduled_date) return false;
      return goal.scheduled_date >= today && goal.scheduled_date <= weekEnd;
    }
    return true;
  });

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
          {filtered.map((goal) => (
            <GoalCard key={goal.id} goal={goal} today={today} linkToDetails detailsFrom="goals" />
          ))}
        </div>
      ) : (
        <EmptyState
          message={
            filter === "today"
              ? "No goals scheduled for today."
              : filter === "week"
              ? "No goals scheduled this week."
              : "All goals completed! Add a new one to keep going."
          }
        />
      )}
    </div>
  );
}
