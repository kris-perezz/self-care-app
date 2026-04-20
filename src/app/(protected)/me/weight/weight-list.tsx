import { deleteWeightLog } from "./actions";
import { Trash } from "@phosphor-icons/react/dist/ssr";
import type { WeightLog } from "@/types";

interface WeightListProps {
  logs: WeightLog[];
  previousWeight: number | null;
}

export function WeightList({ logs, previousWeight }: WeightListProps) {
  if (logs.length === 0) return null;

  return (
    <div className="space-y-2">
      <h2 className="text-small font-semibold text-neutral-700">History</h2>
      <div className="space-y-2">
        {logs.map((log, i) => {
          const prev = i < logs.length - 1 ? logs[i + 1].weight_lbs : previousWeight;
          const delta = prev !== null ? log.weight_lbs - prev : null;

          return (
            <div
              key={log.id}
              className="flex items-center justify-between rounded-2xl border border-black/[0.04] bg-neutral-50 px-4 py-3 shadow-card"
            >
              <div className="flex flex-col">
                <span className="text-small font-semibold text-neutral-900">
                  {log.weight_lbs} lbs
                </span>
                <span className="text-tiny text-neutral-700/70">
                  {formatDate(log.logged_date)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {delta !== null && (
                  <span
                    className={
                      delta > 0
                        ? "text-tiny text-warning-700"
                        : delta < 0
                          ? "text-tiny text-success-700"
                          : "text-tiny text-neutral-700/50"
                    }
                  >
                    {delta > 0 ? "+" : ""}
                    {delta.toFixed(1)}
                  </span>
                )}

                <form action={deleteWeightLog}>
                  <input type="hidden" name="id" value={log.id} />
                  <button
                    type="submit"
                    aria-label="Delete entry"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    <Trash size={16} weight="regular" />
                  </button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
