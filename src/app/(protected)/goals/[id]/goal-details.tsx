import Link from "next/link";
import { CalendarBlank, Clock, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import { formatCurrency } from "@/lib/currency";
import type { Goal } from "@/types";
import { Badge, Button, Card, FluentEmoji } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

export function GoalDetailsContent({
  goal,
  showEdit = true,
}: {
  goal: Goal;
  showEdit?: boolean;
}) {
  return (
    <div className="space-y-4">
      <Card variant={goal.completed_at ? "muted" : "standard"}>
        <div className="flex items-start gap-3">
          <div className="shrink-0" role="img" aria-label={goal.title}>
            <FluentEmoji emoji={goal.emoji || EMOJI.target} size={28} label={goal.title} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-body font-semibold text-neutral-900">{goal.title}</h3>
              {goal.completed_at ? <Badge variant="status">Completed</Badge> : null}
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

          {goal.scheduled_date ? (
            <span className="inline-flex h-5 items-center gap-1 rounded-lg bg-neutral-100 px-2 text-[11px] font-medium leading-none text-neutral-700/70">
              <CalendarBlank size={12} weight="regular" />
              {formatDate(goal.scheduled_date)}
            </span>
          ) : null}

          {goal.scheduled_time ? (
            <span className="inline-flex h-5 items-center gap-1 rounded-lg bg-neutral-100 px-2 text-[11px] font-medium leading-none text-neutral-700/70">
              <Clock size={12} weight="regular" />
              {formatTime(goal.scheduled_time)}
            </span>
          ) : null}
        </div>
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
