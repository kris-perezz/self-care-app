import { formatCurrency } from "@/lib/currency";
import { FluentEmoji, StatCard } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

export function BalanceCard({ balance }: { balance: number }) {
  return (
    <StatCard
      variant="tintAccent"
      label="Your balance"
      value={formatCurrency(balance)}
      icon={<FluentEmoji emoji={EMOJI.gift} size={18} />}
      className="!space-y-0.5"
    />
  );
}
