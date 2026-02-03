import { formatCurrency } from "@/lib/currency";
import type { Reward } from "@/types";

export function RewardProgress({
  reward,
  balance,
}: {
  reward: Reward;
  balance: number;
}) {
  const progress = Math.min(balance / reward.price, 1);
  const remaining = Math.max(reward.price - balance, 0);

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{reward.emoji}</span>
          <span className="text-sm font-medium text-gray-900">{reward.name}</span>
        </div>
        <span className="text-xs text-gray-500">
          {formatCurrency(balance)} / {formatCurrency(reward.price)}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-gray-500">
        {remaining > 0
          ? `${formatCurrency(remaining)} to go`
          : "Ready to redeem!"}
      </p>
    </div>
  );
}
