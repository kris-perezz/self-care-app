import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { BalanceCard } from "./balance-card";
import { RewardCard } from "./reward-card";
import { NewRewardForm } from "./new-reward-form";
import { PresetRewards } from "./preset-rewards";
import type { Reward } from "@/types";
import { Card, EmptyState, FluentEmoji } from "@/components/ui";

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
      <h2 className="heading-large text-neutral-900">Rewards</h2>

      <BalanceCard balance={balance} />

      <div className="space-y-3">
        <h3 className="heading-section text-neutral-900">IRL Rewards</h3>

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
          <EmptyState message="Add a reward to start saving toward something!" />
        )}

        <NewRewardForm />
      </div>

      <PresetRewards />

      {purchasedRewards.length > 0 && (
        <div className="space-y-3">
          <h3 className="heading-section text-neutral-700">Purchased</h3>
          <div className="space-y-2">
            {purchasedRewards.map((reward) => (
              <Card
                key={reward.id}
                variant="muted"
                className="flex items-center gap-3 opacity-60"
              >
                <span className="grayscale">
                  <FluentEmoji emoji={reward.emoji} size={24} />
                </span>
                <span className="flex-1 text-small text-neutral-700 line-through">
                  {reward.name}
                </span>
                <span className="text-tiny text-neutral-700/70">
                  {formatCurrency(reward.price)}
                </span>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
