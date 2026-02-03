"use client";

import { useTransition } from "react";
import Link from "next/link";
import { completeGoal, deleteGoal } from "./actions";
import { formatCurrency } from "@/lib/currency";
import type { Goal } from "@/types";

const DIFFICULTY_COLORS = {
  easy: "bg-primary/20 text-primary-dark",
  medium: "bg-tan/60 text-gray-700",
  hard: "bg-pink/30 text-pink-800",
} as const;

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
      <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-100 bg-gray-50/80 p-4">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary">
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-400 line-through">{goal.title}</p>
        </div>
        <span className={`shrink-0 rounded-xl px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[goal.difficulty]} opacity-50`}>
          {formatCurrency(goal.currency_reward)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white p-4">
      <button
        onClick={handleComplete}
        disabled={isPending}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 border-gray-300 transition-colors hover:border-primary hover:bg-primary/10 disabled:opacity-50"
        aria-label={`Complete "${goal.title}"`}
      >
        {isPending && (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{goal.title}</p>
        {!compact && goal.description && (
          <p className="mt-0.5 truncate text-xs text-gray-500">{goal.description}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {goal.scheduled_time && (
            <span className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
              <CalendarIcon />
              {formatTime(goal.scheduled_time)}
            </span>
          )}
          <span className={`rounded-xl px-2 py-0.5 text-xs font-medium ${DIFFICULTY_COLORS[goal.difficulty]}`}>
            {goal.difficulty} {formatCurrency(goal.currency_reward)}
          </span>
        </div>
      </div>
      {!compact && (
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href={`/goals/${goal.id}/edit`}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Edit goal"
          >
            <PencilIcon />
          </Link>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-pink/10 hover:text-pink-700 disabled:opacity-50"
            aria-label="Delete goal"
          >
            {isDeleting ? (
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-pink border-t-transparent" />
            ) : (
              <TrashIcon />
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function CalendarIcon() {
  return (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}
