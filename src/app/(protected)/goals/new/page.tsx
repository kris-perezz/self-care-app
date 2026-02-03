"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createGoal, type ActionState } from "../actions";
import { DIFFICULTY_REWARDS, formatCurrency } from "@/lib/currency";

const initialState: ActionState = { error: null };

export default function NewGoalPage() {
  const [state, formAction, isPending] = useActionState(createGoal, initialState);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/goals"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/50"
          aria-label="Back to goals"
        >
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">New Goal</h2>
      </div>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
            {state.error}
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="mt-1 block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            placeholder="e.g., Drink 8 glasses of water"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="mt-1 block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            placeholder="Add some details or motivation..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Difficulty</label>
          <div className="mt-2 flex gap-2">
            {(["easy", "medium", "hard"] as const).map((d) => (
              <label
                key={d}
                className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-gray-200 bg-white p-3 text-center transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/10"
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={d}
                  defaultChecked={d === "medium"}
                  className="sr-only"
                />
                <span className="text-sm font-medium capitalize">{d}</span>
                <span className="text-xs text-gray-500">
                  {formatCurrency(DIFFICULTY_REWARDS[d])}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700">
              Date <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="scheduled_date"
              name="scheduled_date"
              type="date"
              className="mt-1 block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="scheduled_time" className="block text-sm font-medium text-gray-700">
              Time <span className="text-gray-400">(optional)</span>
            </label>
            <input
              id="scheduled_time"
              name="scheduled_time"
              type="time"
              className="mt-1 block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Goal"}
        </button>
      </form>
    </div>
  );
}
