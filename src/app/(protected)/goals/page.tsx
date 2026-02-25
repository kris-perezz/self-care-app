import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { perf } from "@/lib/perf";
import { GoalFilters } from "./goal-filters";
import { CompletedSection } from "./completed-section";
import type { Goal } from "@/types";
import { Button, EmptyState, PageHeader } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const done = perf("[server] /goals total");
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const doneData = perf("[server] /goals query");
  const { data } = await supabase
    .from("goals")
    .select("id, title, emoji, scheduled_date, completed_at, difficulty, currency_reward, description, scheduled_time")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  doneData();
  done();

  const goals = (data as Goal[]) ?? [];
  const activeGoals = goals.filter((g) => g.completed_at === null);
  const completedGoals = goals.filter((g) => g.completed_at !== null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Goals"
        rightSlot={
          <Button asChild variant="ghostAccent" size="sm">
            <Link href="/goals/new">+ New Goal</Link>
          </Button>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          message="No goals yet. Create your first self-care goal to get started!"
          className="p-8"
        />
      ) : (
        <>
          <GoalFilters goals={activeGoals} />
          <CompletedSection goals={completedGoals} />
        </>
      )}
    </div>
  );
}
