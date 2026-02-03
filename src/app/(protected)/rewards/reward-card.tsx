"use client";

import { useTransition } from "react";
import { formatCurrency } from "@/lib/currency";
import { purchaseReward, setActiveReward, deleteReward } from "./actions";
import type { Reward } from "@/types";

export function RewardCard({
  reward,
  balance,
}: {
  reward: Reward;
  balance: number;
}) {
  const [isPurchasing, startPurchase] = useTransition();
  const [isSettingActive, startSetActive] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const progress = Math.min(balance / reward.price, 1);
  const remaining = Math.max(reward.price - balance, 0);
  const canPurchase = balance >= reward.price;

  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="text-lg">{reward.emoji}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{reward.name}</span>
            {reward.is_active && (
              <span className="rounded-lg bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary-dark">
                Active goal
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {formatCurrency(Math.min(balance, reward.price))} / {formatCurrency(reward.price)}
            {remaining > 0 && ` · ${formatCurrency(remaining)} to go`}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!reward.is_active && (
            <button
              onClick={() => startSetActive(() => { void setActiveReward(reward.id); })}
              disabled={isSettingActive}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              title="Set as active goal"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
            </button>
          )}
          <button
            onClick={() => startDelete(() => { void deleteReward(reward.id); })}
            disabled={isDeleting}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-pink/10 hover:text-pink-700"
            title="Delete reward"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {canPurchase && (
        <button
          onClick={() => startPurchase(() => { void purchaseReward(reward.id); })}
          disabled={isPurchasing}
          className="mt-3 w-full rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {isPurchasing ? "Purchasing..." : `Redeem (${formatCurrency(reward.price)})`}
        </button>
      )}
    </div>
  );
}
