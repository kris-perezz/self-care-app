import { formatCurrency } from "@/lib/currency";
import type { Reward } from "@/types";
import { Card, FluentEmoji, ProgressBar } from "@/components/ui";

export function RewardProgress({
  reward,
  balance,
}: {
  reward: Reward;
  balance: number;
}) {
  const remaining = Math.max(reward.price - balance, 0);

  return (
    <Card variant="standard">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FluentEmoji emoji={reward.emoji} size={20} />
          <span className="text-body font-medium text-neutral-900">
            {reward.name}
          </span>
        </div>
        <span className="text-tiny text-neutral-700/70">
          {formatCurrency(balance)} / {formatCurrency(reward.price)}
        </span>
      </div>
      <ProgressBar value={balance} max={reward.price} className="mt-3 h-2" />
      <p className="mt-1.5 text-tiny text-neutral-700/70">
        {remaining > 0
          ? `${formatCurrency(remaining)} to go`
          : "Ready to redeem!"}
      </p>
    </Card>
  );
}
