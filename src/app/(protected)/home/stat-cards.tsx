import { type ReactNode } from "react";
import { formatCurrency } from "@/lib/currency";
import { StatCard } from "@/components/ui";
import { FluentEmoji } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";
import { TodayProgressRing } from "./today-progress-ring";

function getStreakDisplay(streak: number): ReactNode {
  const isDoubleFire = streak >= 14 && streak < 30;
  const emoji =
    streak >= 30 ? EMOJI.lightning :
    streak >= 7  ? EMOJI.fire :
    streak >= 3  ? EMOJI.herb :
    EMOJI.seedling;

  return (
    <span
      className="flex items-center gap-1"
      aria-label={`${streak} day streak`}
    >
      <FluentEmoji emoji={emoji} size={28} label="" />
      {isDoubleFire && <FluentEmoji emoji={EMOJI.fire} size={28} label="" />}
      <span aria-hidden>{streak}</span>
    </span>
  );
}

export function StatCards({
  balance,
  streak,
  completedToday,
  totalToday,
  perfectDay,
}: {
  balance: number;
  streak: number;
  completedToday: number;
  totalToday: number;
  perfectDay: boolean;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard variant="tintAccent" label="Balance" value={formatCurrency(balance)} />
      <StatCard
        variant="tintPrimary"
        label="Day streak"
        value={getStreakDisplay(streak)}
        className={streak >= 7 ? "ring-2 ring-warning-300" : undefined}
      />
      <StatCard
        variant={perfectDay ? "tintPrimary" : "tintSecondary"}
        label="Today"
        value={<TodayProgressRing completedToday={completedToday} totalToday={totalToday} />}
      />
    </div>
  );
}
