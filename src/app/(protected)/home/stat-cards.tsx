import { formatCurrency } from "@/lib/currency";

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
      <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #ffe4fa, #ffc4eb)" }}>
        <p className="text-xs font-medium text-pink-800/70">Balance</p>
        <p className="mt-1 text-xl font-bold text-pink-900">{formatCurrency(balance)}</p>
      </div>
      <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg, #d4edda, #abc798)" }}>
        <p className="text-xs font-medium text-green-800/70">Day streak</p>
        <p className="mt-1 text-xl font-bold text-green-900">{streak}</p>
      </div>
      <div className="rounded-2xl border-2 border-gray-200 bg-white p-4">
        <p className="text-xs font-medium text-gray-500">Today</p>
        <p className="mt-1 text-xl font-bold text-gray-900">
          {completedToday}/{totalToday}
        </p>
      </div>
    </div>
  );
}
