"use client";

import { useState } from "react";
import { FilterButton } from "@/components/filter-button";
import { GoalHistoryCard } from "./goal-history-card";
import type { Goal } from "@/types";
import { EmptyState } from "@/components/ui";

type DifficultyFilter = "all" | "easy" | "medium" | "hard";
type DateFilter = "week" | "month" | "all";

export function GoalHistoryFilters({ goals }: { goals: Goal[] }) {
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [dateRange, setDateRange] = useState<DateFilter>("all");

  const filtered = goals.filter((goal) => {
    if (difficulty !== "all" && goal.difficulty !== difficulty) return false;

    if (dateRange !== "all" && goal.completed_at) {
      const completedDate = new Date(goal.completed_at);
      const now = new Date();
      if (dateRange === "week") {
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (completedDate < weekAgo) return false;
      } else if (dateRange === "month") {
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (completedDate < monthAgo) return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(["all", "easy", "medium", "hard"] as const).map((d) => (
          <FilterButton
            key={d}
            active={difficulty === d}
            onClick={() => setDifficulty(d)}
          >
            {d === "all"
              ? "All"
              : d.charAt(0).toUpperCase() + d.slice(1)}
          </FilterButton>
        ))}
      </div>

      <div className="flex gap-2">
        {(["week", "month", "all"] as const).map((dr) => (
          <FilterButton
            key={dr}
            active={dateRange === dr}
            onClick={() => setDateRange(dr)}
          >
            {dr === "week"
              ? "This week"
              : dr === "month"
                ? "This month"
                : "All time"}
          </FilterButton>
        ))}
      </div>

      <p className="text-tiny text-neutral-700/70">
        {filtered.length} completed goal{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((goal) => (
            <GoalHistoryCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <EmptyState message="No goals match these filters." />
      )}
    </div>
  );
}
