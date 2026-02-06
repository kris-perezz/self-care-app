import { formatCurrency } from "@/lib/currency";
import { StatCard } from "@/components/ui";

export function StatCards({
  balance,
  streak,
  completedToday,
  totalToday,
}: {
  balance: number;
  streak: number;
  completedToday: number;
  totalToday: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <StatCard variant="tintAccent" label="Balance" value={formatCurrency(balance)} />
      <StatCard variant="tintPrimary" label="Day streak" value={streak} />
      <StatCard
        variant="tintSecondary"
        label="Today"
        value={`${completedToday}/${totalToday}`}
      />
    </div>
  );
}
