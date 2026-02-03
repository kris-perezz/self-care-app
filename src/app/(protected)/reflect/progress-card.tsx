import { formatCurrency } from "@/lib/currency";

export function ProgressCard({
  totalWords,
  totalEarned,
}: {
  totalWords: number;
  totalEarned: number;
}) {
  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500">Keep writing to earn 📝</p>
          <p className="mt-1 text-sm text-gray-700">
            You&apos;ve written <span className="font-bold">{totalWords}</span> words today
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Earned</p>
          <p className="text-sm font-bold text-primary-dark">{formatCurrency(totalEarned)}</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${Math.min((totalWords / 500) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
