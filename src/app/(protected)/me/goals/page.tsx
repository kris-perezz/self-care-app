import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { GoalHistoryFilters } from "./goal-history-filters";
import type { Goal } from "@/types";
import { EmptyState, StatCard } from "@/components/ui";
import { BackLink } from "@/components/nav/back-link";

export default async function GoalHistoryPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data } = await supabase
    .from("goals")
    .select("id, title, emoji, completed_at, difficulty, currency_reward, scheduled_date")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(100);

  const goals = (data as Goal[]) ?? [];
  const totalEarned = goals.reduce((sum, g) => sum + g.currency_reward, 0);

  return (
    <div className="space-y-6">
      <div>
        <BackLink href="/me" />
        <h1 className="heading-large text-neutral-900">Goal History</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 text-center">
        <StatCard variant="tintPrimary" label="Goals completed" value={goals.length} />
        <StatCard variant="tintPrimary" label="Total earned" value={formatCurrency(totalEarned)} />
      </div>

      {goals.length === 0 ? (
        <EmptyState
          message="No completed goals yet. Complete some goals to see your history!"
          className="p-8"
        />
      ) : (
        <GoalHistoryFilters goals={goals} />
      )}
    </div>
  );
}
