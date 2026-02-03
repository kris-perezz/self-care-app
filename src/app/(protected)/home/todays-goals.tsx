import Link from "next/link";
import { GoalCard } from "../goals/goal-card";
import type { Goal } from "@/types";

export function TodaysGoals({ goals }: { goals: Goal[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">
          Today&apos;s goals
        </h3>
        <Link href="/goals" className="text-xs font-medium text-primary-dark">
          View all
        </Link>
      </div>

      {goals.length > 0 ? (
        <div className="space-y-2">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} compact />
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No goals scheduled for today. Add some from the Goals tab!
        </p>
      )}

      <Link
        href="/goals/new"
        className="flex w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-400 hover:border-primary hover:text-primary-dark"
      >
        + Add Goal
      </Link>
    </div>
  );
}
