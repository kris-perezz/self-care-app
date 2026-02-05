import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { GoalHistoryFilters } from "./goal-history-filters";
import type { Goal } from "@/types";

export default async function GoalHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  const goals = (data as Goal[]) ?? [];
  const totalEarned = goals.reduce((sum, g) => sum + g.currency_reward, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/me"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/50"
          aria-label="Back to profile"
        >
          <svg
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </Link>
        <h2 className="heading-large text-neutral-900">Goal History</h2>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl bg-primary/10 p-4">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-primary-dark">
              {goals.length}
            </p>
            <p className="text-xs text-gray-600">Goals completed</p>
          </div>
          <div>
            <p className="text-xl font-bold text-primary-dark">
              {formatCurrency(totalEarned)}
            </p>
            <p className="text-xs text-gray-600">Total earned</p>
          </div>
        </div>
      </div>

      {goals.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">
            No completed goals yet. Complete some goals to see your history!
          </p>
        </div>
      ) : (
        <GoalHistoryFilters goals={goals} />
      )}
    </div>
  );
}
