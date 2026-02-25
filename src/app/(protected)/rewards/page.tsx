import { createClient } from "@/lib/supabase/server";
import { getBalance, getUser } from "@/lib/queries";
import { formatCurrency } from "@/lib/currency";
import { perf } from "@/lib/perf";
import { BalanceCard } from "./balance-card";
import { RewardCard } from "./reward-card";
import { NewRewardForm } from "./new-reward-form";
import { PresetRewards } from "./preset-rewards";
import type { Reward } from "@/types";
import { Card, EmptyState, FluentEmoji } from "@/components/ui";

export default async function RewardsPage() {
  const done = perf("[server] /rewards total");
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const doneData = perf("[server] /rewards queries");

  const [balance, { data }] = await Promise.all([
    getBalance(),
    supabase
      .from("rewards")
      .select("id, name, emoji, price, purchased_at, is_active, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  doneData();
  done();

  const rewards = (data as Reward[]) ?? [];
  const activeRewards = rewards.filter((r) => r.purchased_at === null);
  const purchasedRewards = rewards.filter((r) => r.purchased_at !== null);

  return (
    <div className="space-y-6">
      <h1 className="heading-large text-neutral-900">Rewards</h1>
      <BalanceCard balance={balance} />

      <div className="space-y-3">
        <h3 className="heading-section text-neutral-900">IRL Rewards</h3>

        {activeRewards.length > 0 ? (
          <div className="space-y-2">
            {activeRewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} balance={balance} />
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
