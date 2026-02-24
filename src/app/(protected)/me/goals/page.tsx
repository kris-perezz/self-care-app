import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { GoalHistoryFilters } from "./goal-history-filters";
import type { Goal } from "@/types";
import { EmptyState, PageHeader, StatCard } from "@/components/ui";

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
      <PageHeader title="Goal History" backHref="/me" backLabel="Back to profile" />

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
