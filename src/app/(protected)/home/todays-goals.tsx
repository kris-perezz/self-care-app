import Link from "next/link";
import { GoalCard } from "../goals/goal-card";
import type { Goal } from "@/types";
import { Button } from "@/components/ui";

export function TodaysGoals({ goals }: { goals: Goal[] }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="heading-section text-neutral-900">Today&apos;s goals</h3>
        <Button asChild variant="secondary" size="sm">
          <Link href="/goals">View all</Link>
        </Button>
      </div>

      {goals.length > 0 ? (
        <div className="space-y-3">
          {[...goals]
            .sort((a, b) => {
              const aDone = a.completed_at !== null;
              const bDone = b.completed_at !== null;
              if (aDone === bDone) return 0;
              return aDone ? 1 : -1;
            })
            .map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              linkToDetails
              actions="full"
            />
          ))}
        </div>
      ) : (
        <p className="text-body text-neutral-700/70">
          No goals scheduled for today. Add some from the Goals tab!
        </p>
      )}

      <Button asChild variant="ghostAccent" className="w-full">
        <Link href="/goals/new">+ Add Goal</Link>
      </Button>
    </div>
  );
}
