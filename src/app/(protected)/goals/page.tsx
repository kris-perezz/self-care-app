import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GoalFilters } from "./goal-filters";
import { CompletedSection } from "./completed-section";
import type { Goal } from "@/types";

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Goals</h2>
        <Link
          href="/goals/new"
          className="rounded-2xl bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-dark"
        >
          + New Goal
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">
            No goals yet. Create your first self-care goal to get started!
          </p>
        </div>
      ) : (
        <>
          <GoalFilters goals={activeGoals} />
          <CompletedSection goals={completedGoals} />
        </>
      )}
    </div>
  );
}
