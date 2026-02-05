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
      <div className="rounded-2xl bg-accent-100 p-4 shadow-card">
        <p className="text-tiny text-neutral-700">Balance</p>
        <p className="mt-1 text-xl font-bold text-neutral-900">{formatCurrency(balance)}</p>
      </div>
      <div className="rounded-2xl bg-primary-100 p-4 shadow-card">
        <p className="text-tiny text-neutral-700">Day streak</p>
        <p className="mt-1 text-xl font-bold text-neutral-900">{streak}</p>
      </div>
      <div className="rounded-2xl bg-secondary-100 p-4 shadow-card">
        <p className="text-tiny text-neutral-700">Today</p>
        <p className="mt-1 text-xl font-bold text-neutral-900">
          {completedToday}/{totalToday}
        </p>
      </div>
    </div>
  );
}
