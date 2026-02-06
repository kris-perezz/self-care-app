"use client";

import { useTransition } from "react";
import { Star, Trash } from "@phosphor-icons/react/dist/ssr";
import { formatCurrency } from "@/lib/currency";
import { purchaseReward, setActiveReward, deleteReward } from "./actions";
import type { Reward } from "@/types";
import {
  Badge,
  Button,
  Card,
  FluentEmoji,
  IconButton,
  ProgressBar,
} from "@/components/ui";

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

  const remaining = Math.max(reward.price - balance, 0);
  const canPurchase = balance >= reward.price;

  return (
    <Card variant="standard">
      <div className="flex items-center gap-3">
        <FluentEmoji emoji={reward.emoji} size={28} />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-small text-neutral-900">{reward.name}</span>
            {reward.is_active ? <Badge variant="status">Active goal</Badge> : null}
          </div>
          <p className="text-tiny text-neutral-700/70">
            {formatCurrency(Math.min(balance, reward.price))} / {formatCurrency(reward.price)}
            {remaining > 0 ? ` - ${formatCurrency(remaining)} to go` : ""}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {!reward.is_active ? (
            <IconButton
              onClick={() =>
                startSetActive(() => {
                  void setActiveReward(reward.id);
                })
              }
              disabled={isSettingActive}
              variant="neutral"
              title="Set as active goal"
              aria-label="Set as active goal"
            >
              <Star size={16} weight="regular" />
            </IconButton>
          ) : null}

          <IconButton
            onClick={() =>
              startDelete(() => {
                void deleteReward(reward.id);
              })
            }
            disabled={isDeleting}
            variant="accent"
            title="Delete reward"
            aria-label="Delete reward"
          >
            <Trash size={16} weight="regular" />
          </IconButton>
        </div>
      </div>

      <ProgressBar value={Math.min(balance, reward.price)} max={reward.price} className="mt-3" />

      {canPurchase ? (
        <Button
          onClick={() =>
            startPurchase(() => {
              void purchaseReward(reward.id);
            })
          }
          disabled={isPurchasing}
          className="mt-3 w-full"
        >
          {isPurchasing ? "Purchasing..." : `Redeem (${formatCurrency(reward.price)})`}
        </Button>
      ) : null}
    </Card>
  );
}
