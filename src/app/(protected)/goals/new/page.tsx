"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createGoal, type ActionState } from "../actions";

const initialState: ActionState = { error: null };

export default function NewGoalPage() {
  const [state, formAction, isPending] = useActionState(createGoal, initialState);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/goals"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100"
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
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="Add some details or motivation..."
          />
        </div>

        <div>
          <label htmlFor="currency_reward" className="block text-sm font-medium text-gray-700">
            Currency reward
          </label>
          <input
            id="currency_reward"
            name="currency_reward"
            type="number"
            required
            min={1}
            max={100}
            defaultValue={10}
            className="mt-1 block w-24 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Points you&apos;ll earn when you complete this goal (1–100)
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isPending ? "Creating..." : "Create Goal"}
        </button>
      </form>
    </div>
  );
}
