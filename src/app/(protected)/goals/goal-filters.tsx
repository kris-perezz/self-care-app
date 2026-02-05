"use client";

import { useState } from "react";
import { FilterButton } from "@/components/filter-button";
import { GoalCard } from "./goal-card";
import type { Goal } from "@/types";

type Filter = "today" | "week" | "all";

export function GoalFilters({ goals }: { goals: Goal[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const today = new Date().toLocaleDateString("en-CA");
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const weekEnd = weekFromNow.toLocaleDateString("en-CA");

  const filtered = goals.filter((goal) => {
    if (filter === "all") return true;
    if (!goal.scheduled_date) return false;
    if (filter === "today") return goal.scheduled_date === today;
    if (filter === "week") return goal.scheduled_date >= today && goal.scheduled_date <= weekEnd;
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
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-500">
            {filter === "today"
              ? "No goals scheduled for today."
              : filter === "week"
              ? "No goals scheduled this week."
              : "All goals completed! Add a new one to keep going."}
          </p>
        </div>
      )}
    </div>
  );
}
