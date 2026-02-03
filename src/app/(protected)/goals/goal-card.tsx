"use client";

import { useTransition } from "react";
import Link from "next/link";
import { completeGoal } from "./actions";
import type { Goal } from "@/types";

export function GoalCard({ goal }: { goal: Goal }) {
  const [isPending, startTransition] = useTransition();

  function handleComplete() {
    startTransition(() => {
      completeGoal(goal.id);
    });
  }

  if (goal.completed_at !== null) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600">
          <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-400 line-through">{goal.title}</p>
          {goal.description && (
            <p className="mt-0.5 truncate text-xs text-gray-300">{goal.description}</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-gray-300">
          <CoinIcon />
          <span>{goal.currency_reward}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-xl border border-gray-200 p-4">
      <button
        onClick={handleComplete}
        disabled={isPending}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 transition-colors hover:border-indigo-400 disabled:opacity-50"
        aria-label={`Complete "${goal.title}"`}
      >
        {isPending && (
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
        )}
      </button>
      <Link href={`/goals/${goal.id}/edit`} className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-900">{goal.title}</p>
        {goal.description && (
          <p className="mt-0.5 truncate text-xs text-gray-500">{goal.description}</p>
        )}
      </Link>
      <div className="flex shrink-0 items-center gap-1 text-xs font-medium text-indigo-600">
        <CoinIcon />
        <span>{goal.currency_reward}</span>
      </div>
    </div>
  );
}

function CoinIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.798 7.45c.512-.67 1.135-.95 1.702-.95s1.19.28 1.702.95a.75.75 0 0 0 1.192-.91C12.637 5.55 11.596 5 10.5 5s-2.137.55-2.894 1.54A5.205 5.205 0 0 0 6.83 8H5.75a.75.75 0 0 0 0 1.5h.77a6.333 6.333 0 0 0 0 1h-.77a.75.75 0 0 0 0 1.5h1.08c.183.528.442 1.023.776 1.46.757.99 1.798 1.54 2.894 1.54s2.137-.55 2.894-1.54a.75.75 0 0 0-1.192-.91c-.512.67-1.135.95-1.702.95s-1.19-.28-1.702-.95a3.505 3.505 0 0 1-.343-.55h1.795a.75.75 0 0 0 0-1.5H8.026a4.835 4.835 0 0 1 0-1h2.224a.75.75 0 0 0 0-1.5H8.455c.098-.195.212-.38.343-.55Z" clipRule="evenodd" />
    </svg>
  );
}
