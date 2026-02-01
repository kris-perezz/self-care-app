import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GoalCard } from "./goal-card";
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

  const activeGoals = goals.filter((g) => !g.is_completed);
  const completedGoals = goals.filter((g) => g.is_completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Goals</h2>
        <Link
          href="/goals/new"
          className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Goal
        </Link>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">
            No goals yet. Create your first self-care goal to get started!
          </p>
        </div>
      ) : (
        <>
          {activeGoals.length > 0 ? (
            <div className="space-y-3">
              {activeGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
              <p className="text-sm text-gray-500">
                All goals completed! Add a new one to keep going.
              </p>
            </div>
          )}

          <CompletedSection goals={completedGoals} />
        </>
      )}
    </div>
  );
}
