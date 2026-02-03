import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { BalanceCard } from "./balance-card";
import { RewardCard } from "./reward-card";
import { NewRewardForm } from "./new-reward-form";
import { PresetRewards } from "./preset-rewards";
import type { Reward } from "@/types";

export default async function RewardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: transactions }, { data: rewards }] = await Promise.all([
    supabase
      .from("currency_transactions")
      .select("amount")
      .eq("user_id", user.id),
    supabase
      .from("rewards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const balance = transactions?.reduce((sum, t) => sum + t.amount, 0) ?? 0;
  const activeRewards = ((rewards as Reward[]) ?? []).filter(
    (r) => r.purchased_at === null
  );
  const purchasedRewards = ((rewards as Reward[]) ?? []).filter(
    (r) => r.purchased_at !== null
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Rewards</h2>

      <BalanceCard balance={balance} />

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-900">IRL Rewards</h3>

        {activeRewards.length > 0 ? (
          <div className="space-y-2">
            {activeRewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                balance={balance}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Add a reward to start saving toward something!
          </p>
        )}

        <NewRewardForm />
      </div>

      <PresetRewards />

      {purchasedRewards.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500">Purchased</h3>
          <div className="space-y-2">
            {purchasedRewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-gray-50/80 p-4"
              >
                <span className="text-lg">{reward.emoji}</span>
                <span className="flex-1 text-sm font-medium text-gray-400 line-through">
                  {reward.name}
                </span>
                <span className="text-xs text-gray-400">
                  {formatCurrency(reward.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
