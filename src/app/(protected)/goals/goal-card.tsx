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
import { cn } from "@/lib/utils";

type GoalCardActions = "full" | "complete" | "none";

export function GoalCard({
  goal,
  linkToDetails = false,
  detailsFrom,
  actions = "full",
  today = "",
  index,
}: {
  goal: Goal;
  linkToDetails?: boolean;
  detailsFrom?: "home" | "goals" | "me";
  actions?: GoalCardActions;
  today?: string;
  index?: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [justCompleted, setJustCompleted] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<((opts: object) => void) | null>(null);
  const rewardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    import("canvas-confetti").then((m) => {
      confettiRef.current = m.default as (opts: object) => void;
    });
  }, []);

  useEffect(() => {
    return () => {
      if (rewardTimeoutRef.current) clearTimeout(rewardTimeoutRef.current);
    };
  }, []);

  const detailsHref = detailsFrom
    ? `/goals/${goal.id}/view?from=${detailsFrom}`
    : `/goals/${goal.id}/view`;

  const isCompleted = goal.recurring_days
    ? goal.last_completed_date === today
    : goal.completed_at !== null;

  const bloomColor =
    goal.difficulty === "hard"
      ? "var(--color-accent-700)"
      : goal.difficulty === "medium"
      ? "var(--color-secondary-500)"
      : "var(--color-primary-500)";

  const staggerStyle =
    index !== undefined
      ? { animationDelay: `${index * 50}ms`, animationFillMode: "backwards" as const }
      : undefined;

  function handleComplete() {
    setJustCompleted(true);
    setShowReward(true);
    rewardTimeoutRef.current = setTimeout(() => setShowReward(false), 1100);

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
      <Card
        variant="muted"
        interactive={linkToDetails}
        className={cn(
          "relative flex items-start gap-3 border border-neutral-200",
          index !== undefined && "page-enter"
        )}
        style={staggerStyle}
      >
        {linkToDetails && (
          <Link
            href={detailsHref}
            className="absolute inset-0 z-0 rounded-2xl"
            aria-label={`View ${goal.title}`}
          />
        )}

        <div className="shrink-0 grayscale">
          <FluentEmoji emoji={goal.emoji || EMOJI.target} size={24} label={goal.title} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-body text-neutral-500">{goal.title}</p>
          {goal.description ? (
            <p className="mt-0.5 truncate text-tiny text-neutral-400">
              {goal.description}
            </p>
          ) : null}
        </div>

        <div className="relative z-[1] ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
          <Check size={16} weight="bold" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      ref={cardRef}
      variant="standard"
      interactive
      className={cn(
        "relative flex items-start gap-3",
        index !== undefined && "page-enter"
      )}
      style={staggerStyle}
    >
      {linkToDetails && (
        <Link
          href={detailsHref}
          className="absolute inset-0 z-0 rounded-2xl"
          aria-label={`View ${goal.title}`}
        />
      )}

      <div className="shrink-0" role="img" aria-label={goal.title}>
        <FluentEmoji emoji={goal.emoji || EMOJI.target} size={24} label={goal.title} />
      </div>

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

      {showReward && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-2 -translate-x-1/2 animate-float-reward"
        >
          +{formatCurrency(goal.currency_reward)}
        </span>
      )}

      {actions !== "none" ? (
        <span className="relative z-[1] ml-auto shrink-0">
          {justCompleted && (
            <span
              className="animate-bloom-ring"
              style={{ "--bloom-color": bloomColor } as React.CSSProperties}
            />
          )}
          <IconButton
            onClick={handleComplete}
            disabled={isPending}
            variant="primary"
            size="md"
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
