"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Check, Clock, PencilSimple, Trash } from "@phosphor-icons/react/dist/ssr";
import { completeGoal, deleteGoal } from "./actions";
import { formatCurrency } from "@/lib/currency";
import type { Goal } from "@/types";
import { Badge, Card, FluentEmoji, IconButton } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

export function GoalCard({ goal, compact }: { goal: Goal; compact?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleComplete() {
    startTransition(() => {
      void completeGoal(goal.id);
    });
  }

  function handleDelete() {
    startDeleteTransition(() => {
      void deleteGoal(goal.id);
    });
  }

  if (goal.completed_at !== null) {
    return (
      <Card variant="muted" className="flex items-start gap-3 opacity-60">
        <div className="shrink-0 grayscale">
          <FluentEmoji emoji={goal.emoji || EMOJI.target} size={24} label={goal.title} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-body text-neutral-700 line-through">{goal.title}</p>
          {!compact && goal.description ? (
            <p className="mt-0.5 truncate text-tiny text-neutral-700/70 line-through">
              {goal.description}
            </p>
          ) : null}
        </div>

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

      <div className="min-w-0 flex-1">
        <p className="text-body font-medium text-neutral-900">{goal.title}</p>
        {!compact && goal.description ? (
          <p className="mt-0.5 truncate text-tiny text-neutral-700/70">{goal.description}</p>
        ) : null}

        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {goal.scheduled_time ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-neutral-100 px-2 py-0.5 text-tiny text-neutral-700/70">
              <Clock size={12} weight="regular" />
              {formatTime(goal.scheduled_time)}
            </span>
          ) : null}

          <Badge variant={goal.difficulty}>
            {`${goal.difficulty.toUpperCase()} - ${formatCurrency(goal.currency_reward)}`}
          </Badge>
        </div>
      </div>

      {!compact ? (
        <div className="ml-auto flex shrink-0 items-center gap-1">
          <Link
            href={`/goals/${goal.id}/edit`}
            className="interactive-icon flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Edit goal"
          >
            <PencilSimple size={16} weight="regular" />
          </Link>

          <IconButton
            onClick={handleDelete}
            disabled={isDeleting}
            variant="accent"
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
      ) : (
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
      )}
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
