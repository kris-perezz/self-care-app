"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowsClockwise, Check, Clock } from "@phosphor-icons/react/dist/ssr";
import { completeGoal } from "./actions";
import { formatCurrency } from "@/lib/currency";
import { formatTime } from "@/lib/date";
import { formatRecurringDays } from "@/lib/goals";
import type { Goal } from "@/types";
import { Badge, Card, FluentEmoji, IconButton } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

type GoalCardActions = "full" | "complete" | "none";

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
  const [justCompleted, setJustCompleted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<((opts: object) => void) | null>(null);

  useEffect(() => {
    import("canvas-confetti").then((m) => {
      confettiRef.current = m.default as (opts: object) => void;
    });
  }, []);

  const detailsHref = detailsFrom
    ? `/goals/${goal.id}/view?from=${detailsFrom}`
    : `/goals/${goal.id}/view`;

  const isCompleted = goal.recurring_days
    ? goal.last_completed_date === today
    : goal.completed_at !== null;

  function handleComplete() {
    // Fire animations synchronously before the server action to avoid re-render race
    setJustCompleted(true);
    const rect = cardRef.current?.getBoundingClientRect();
    const originX = rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5;
    const originY = rect ? (rect.top + rect.height / 2) / window.innerHeight : 0.6;
    const configs = {
      easy:   { particleCount: 40,  spread: 50 },
      medium: { particleCount: 80,  spread: 70 },
      hard:   { particleCount: 150, spread: 100 },
    };
    confettiRef.current?.({
      ...configs[goal.difficulty],
      origin: { x: originX, y: originY },
      colors: ["#74A12E", "#F4A6B6", "#d4996f", "#fff"],
    });

    startTransition(async () => {
      await completeGoal(goal.id);
    });
  }

  if (isCompleted) {
    return (
      <Card variant="muted" className="flex items-start gap-3 border border-neutral-200">
        <div className="shrink-0 grayscale">
          <FluentEmoji emoji={goal.emoji || EMOJI.target} size={24} label={goal.title} />
        </div>

        {linkToDetails ? (
          <Link href={detailsHref} className="min-w-0 flex-1">
            <p className="text-body text-neutral-500 line-through">{goal.title}</p>
            {goal.description ? (
              <p className="mt-0.5 truncate text-tiny text-neutral-400 line-through">
                {goal.description}
              </p>
            ) : null}
          </Link>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="text-body text-neutral-500 line-through">{goal.title}</p>
            {goal.description ? (
              <p className="mt-0.5 truncate text-tiny text-neutral-400 line-through">
                {goal.description}
              </p>
            ) : null}
          </div>
        )}

        <div className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-700">
          <Check size={16} weight="bold" />
        </div>
      </Card>
    );
  }

  return (
    <Card ref={cardRef} variant="standard" interactive className="flex items-start gap-3">
      <div className="shrink-0" role="img" aria-label={goal.title}>
        <FluentEmoji emoji={goal.emoji || EMOJI.target} size={24} label={goal.title} />
      </div>

      {linkToDetails ? (
        <Link href={detailsHref} className="min-w-0 flex-1">
          <p className="text-body font-medium text-neutral-900">{goal.title}</p>
          {goal.description ? (
            <p className="mt-0.5 truncate text-tiny text-neutral-500">{goal.description}</p>
          ) : null}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {goal.scheduled_time ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-tiny text-neutral-500">
                <Clock size={12} weight="regular" />
                {formatTime(goal.scheduled_time)}
              </span>
            ) : null}

            {goal.recurring_days && goal.recurring_days.length > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-tiny text-neutral-500">
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
            <p className="mt-0.5 truncate text-tiny text-neutral-500">{goal.description}</p>
          ) : null}

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {goal.scheduled_time ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-tiny text-neutral-500">
                <Clock size={12} weight="regular" />
                {formatTime(goal.scheduled_time)}
              </span>
            ) : null}

            {goal.recurring_days && goal.recurring_days.length > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-tiny text-neutral-500">
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

      {actions !== "none" ? (
        <span className="relative ml-auto shrink-0">
          {justCompleted && <span className="animate-bloom-ring" />}
          <IconButton
            onClick={handleComplete}
            disabled={isPending}
            variant="primary"
            className={justCompleted ? "animate-checkmark-bloom border-2 border-neutral-100 hover:border-primary-500" : "border-2 border-neutral-100 hover:border-primary-500"}
            aria-label={`Complete "${goal.title}"`}
          >
            {isPending ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
            ) : (
              <Check size={16} weight="bold" />
            )}
          </IconButton>
        </span>
      ) : null}
    </Card>
  );
}
