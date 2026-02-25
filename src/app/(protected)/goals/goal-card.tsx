"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ArrowsClockwise, Check, Clock, PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";
import { completeGoal, deleteGoal } from "./actions";
import { formatCurrency } from "@/lib/currency";
import type { Goal } from "@/types";
import { Badge, Card, FluentEmoji, IconButton } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

type GoalCardActions = "full" | "complete" | "none";

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function formatRecurringDays(days: number[]): string {
  const sorted = [...days].sort((a, b) => a - b);
  return sorted.map((d) => DAY_LABELS[d]).join(" · ");
}

export function GoalCard({
  goal,
  linkToDetails = false,
  detailsFrom,
  actions = "full",
  today = "",
}: {
  goal: Goal;
  linkToDetails?: boolean;
  detailsFrom?: "home" | "goals" | "me";
  actions?: GoalCardActions;
  today?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const detailsHref = detailsFrom
    ? `/goals/${goal.id}/view?from=${detailsFrom}`
    : `/goals/${goal.id}/view`;

  const isCompleted = goal.recurring_days
    ? goal.last_completed_date === today
    : goal.completed_at !== null;

  function handleComplete() {
    startTransition(async () => {
      await completeGoal(goal.id);
    });
  }

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteGoal(goal.id);
    });
  }

  if (isCompleted) {
    return (
      <Card variant="muted" className="flex items-start gap-3 opacity-60">
        <div className="shrink-0 grayscale">
          <FluentEmoji emoji={goal.emoji || EMOJI.target} size={24} label={goal.title} />
        </div>

      {linkToDetails ? (
        <Link href={detailsHref} className="min-w-0 flex-1">
          <p className="text-body text-neutral-700 line-through">{goal.title}</p>
          {goal.description ? (
            <p className="mt-0.5 truncate text-tiny text-neutral-700/70 line-through">
              {goal.description}
            </p>
          ) : null}
        </Link>
      ) : (
        <div className="min-w-0 flex-1">
          <p className="text-body text-neutral-700 line-through">{goal.title}</p>
          {goal.description ? (
            <p className="mt-0.5 truncate text-tiny text-neutral-700/70 line-through">
              {goal.description}
            </p>
          ) : null}
        </div>
      )}

        <div className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary-500 text-white">
          <Check size={14} weight="bold" />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="standard" interactive className="flex items-start gap-3">
      <div className="shrink-0" role="img" aria-label={goal.title}>
        <FluentEmoji emoji={goal.emoji || EMOJI.target} size={24} label={goal.title} />
      </div>

      {linkToDetails ? (
        <Link href={detailsHref} className="min-w-0 flex-1">
          <p className="text-body font-medium text-neutral-900">{goal.title}</p>
          {goal.description ? (
            <p className="mt-0.5 truncate text-tiny text-neutral-700/70">{goal.description}</p>
          ) : null}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {goal.scheduled_time ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-tiny text-neutral-700/70">
              <Clock size={12} weight="regular" />
              {formatTime(goal.scheduled_time)}
            </span>
          ) : null}

          {goal.recurring_days && goal.recurring_days.length > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-tiny text-neutral-700/70">
              <ArrowsClockwise size={12} weight="regular" />
              {formatRecurringDays(goal.recurring_days)}
            </span>
          ) : null}

            <Badge variant={goal.difficulty}>
              {`${goal.difficulty.toUpperCase()} - ${formatCurrency(goal.currency_reward)}`}
            </Badge>
          </div>
        </Link>
      ) : (
        <div className="min-w-0 flex-1">
          <p className="text-body font-medium text-neutral-900">{goal.title}</p>
          {goal.description ? (
            <p className="mt-0.5 truncate text-tiny text-neutral-700/70">{goal.description}</p>
          ) : null}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {goal.scheduled_time ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-tiny text-neutral-700/70">
              <Clock size={12} weight="regular" />
              {formatTime(goal.scheduled_time)}
            </span>
          ) : null}

          {goal.recurring_days && goal.recurring_days.length > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-tiny text-neutral-700/70">
              <ArrowsClockwise size={12} weight="regular" />
              {formatRecurringDays(goal.recurring_days)}
            </span>
          ) : null}

            <Badge variant={goal.difficulty}>
              {`${goal.difficulty.toUpperCase()} - ${formatCurrency(goal.currency_reward)}`}
            </Badge>
          </div>
        </div>
      )}

      {actions === "full" ? (
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Link
            href={`/goals/${goal.id}/edit`}
            className="interactive-icon flex h-8 w-8 items-center justify-center rounded-lg border-2 border-neutral-100 text-neutral-500 hover:border-neutral-200 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Edit goal"
          >
            <PencilSimple size={16} weight="regular" />
          </Link>

          <IconButton
            onClick={handleDelete}
            disabled={isDeleting}
            variant="neutral"
            className="border-2 border-neutral-100 text-neutral-500 hover:border-warning-200 hover:bg-warning-100 hover:text-neutral-900"
            aria-label="Delete goal"
            title="Delete goal"
          >
            {isDeleting ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
            ) : (
              <Trash size={16} weight="regular" />
            )}
          </IconButton>

          <IconButton
            onClick={handleComplete}
            disabled={isPending}
            variant="primary"
            className="h-6 w-6 border-2 border-neutral-100 hover:border-primary-500"
            aria-label={`Complete "${goal.title}"`}
          >
            {isPending ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            ) : (
              <Check size={14} weight="bold" />
            )}
          </IconButton>
        </div>
      ) : actions === "complete" ? (
        <IconButton
          onClick={handleComplete}
          disabled={isPending}
          variant="primary"
          className="ml-auto h-6 w-6 shrink-0 border-2 border-neutral-100 hover:border-primary-500"
          aria-label={`Complete "${goal.title}"`}
        >
          {isPending ? (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          ) : (
            <Check size={14} weight="bold" />
          )}
        </IconButton>
      ) : null}
    </Card>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}
