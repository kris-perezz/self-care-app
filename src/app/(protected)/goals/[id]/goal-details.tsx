import Link from "next/link";
import { ArrowsClockwise, CalendarBlank, Clock, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { formatCurrency } from "@/lib/currency";
import type { Goal } from "@/types";
import { Badge, Button, Card, FluentEmoji } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatRecurringDays(days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  if (sorted.length === 7) return "Every day";
  if (sorted.length === 5 && !sorted.includes(0) && !sorted.includes(6)) return "Weekdays";
  if (sorted.length === 2 && sorted.includes(0) && sorted.includes(6)) return "Weekends";
  return sorted.map((d) => DAY_SHORT[d]).join(" · ");
}

export function GoalDetailsContent({
  goal,
  showEdit = true,
}: {
  goal: Goal;
  showEdit?: boolean;
}) {
  const isCompleted = goal.recurring_days
    ? false // recurring goals are never "permanently" completed
    : goal.completed_at !== null;

  return (
    <div className="space-y-4">
      <Card variant={isCompleted ? "muted" : "standard"}>
        <div className="flex items-start gap-3">
          <div className="shrink-0" role="img" aria-label={goal.title}>
            <FluentEmoji emoji={goal.emoji || EMOJI.target} size={28} label={goal.title} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-body font-semibold text-neutral-900">{goal.title}</h3>
              {isCompleted ? <Badge variant="status">Completed</Badge> : null}
              {goal.recurring_days ? <Badge variant="status">Recurring</Badge> : null}
            </div>
            <p className="mt-1 text-small text-neutral-700/80">
              {goal.description?.trim() ? goal.description : "No description added yet."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant={goal.difficulty}>
            {`${goal.difficulty.toUpperCase()} - ${formatCurrency(goal.currency_reward)}`}
          </Badge>

          {goal.recurring_days && goal.recurring_days.length > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-tiny text-neutral-700/70">
              <ArrowsClockwise size={12} weight="regular" />
              {formatRecurringDays(goal.recurring_days)}
            </span>
          ) : null}

          {goal.scheduled_date ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-tiny text-neutral-700/70">
              <CalendarBlank size={12} weight="regular" />
              {formatDate(goal.scheduled_date)}
            </span>
          ) : null}

          {goal.scheduled_time ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-tiny text-neutral-700/70">
              <Clock size={12} weight="regular" />
              {formatTime(goal.scheduled_time)}
            </span>
          ) : null}
        </div>

        {goal.recurring_days ? (
          <div className="mt-4 border-t border-neutral-100 pt-4">
            <p className="text-tiny text-neutral-700/70">Scheduled on</p>
            <div className="mt-2 flex gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => {
                const active = goal.recurring_days!.includes(d);
                return (
                  <div
                    key={d}
                    className={`flex h-9 flex-1 items-center justify-center rounded-full text-tiny font-medium ${
                      active
                        ? "bg-primary-500 text-white"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                    aria-label={`${DAY_LABELS[d]}${active ? " (scheduled)" : ""}`}
                  >
                    {DAY_SHORT[d]}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {isCompleted && goal.completed_at ? (
          <div className="mt-4 border-t border-neutral-100 pt-4">
            <p className="text-tiny text-neutral-700/70">
              Completed on {formatDate(goal.completed_at.slice(0, 10))}
            </p>
          </div>
        ) : null}
      </Card>

      {showEdit ? (
        <Button asChild variant="ghostAccent" className="w-full">
          <Link href={`/goals/${goal.id}/edit`}>
            <span className="inline-flex items-center justify-center gap-2">
              <PencilSimple size={16} weight="regular" />
              Edit goal
            </span>
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

function formatDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.valueOf())) {
    return date;
  }
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}
