import { formatCurrency } from "@/lib/currency";

export function BalanceCard({ balance }: { balance: number }) {
  return (
    <div className="rounded-2xl bg-accent-100 p-4 shadow-card">
      <p className="text-tiny text-accent-900">Your balance</p>
      <p className="mt-1 text-2xl font-bold text-accent-900">
        💰 {formatCurrency(balance)}
      </p>
    </div>
  );
}
