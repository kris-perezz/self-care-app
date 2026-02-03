import { formatCurrency } from "@/lib/currency";

export function BalanceCard({ balance }: { balance: number }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: "linear-gradient(135deg, #f1dedc, #e1dabd)" }}
    >
      <p className="text-xs font-medium text-gray-600">Your balance</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">
        💰 {formatCurrency(balance)}
      </p>
    </div>
  );
}
