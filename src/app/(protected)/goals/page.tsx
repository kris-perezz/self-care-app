import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GoalFilters } from "./goal-filters";
import { CompletedSection } from "./completed-section";
import type { Goal } from "@/types";
import { Button, EmptyState, PageHeader } from "@/components/ui";

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let goals: Goal[] = [];

  if (user) {
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    goals = (data as Goal[]) ?? [];
  }

  const activeGoals = goals.filter((g) => g.completed_at === null);
  const completedGoals = goals.filter((g) => g.completed_at !== null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        rightSlot={(
          <Button asChild variant="ghostAccent" size="sm">
            <Link href="/goals/new">+ New Goal</Link>
          </Button>
        )}
      />

      {goals.length === 0 ? (
        <EmptyState message="No goals yet. Create your first self-care goal to get started!" className="p-8" />
      ) : (
        <>
          <GoalFilters goals={activeGoals} />
          <CompletedSection goals={completedGoals} />
        </>
      )}
    </div>
  );
}
