"use client";

import { useState } from "react";
import { GoalCard } from "./goal-card";
import type { Goal } from "@/types";

export function CompletedSection({ goals }: { goals: Goal[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (goals.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 py-2 text-sm font-medium text-gray-500"
      >
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
        Completed ({goals.length})
      </button>
      {isOpen && (
        <div className="space-y-3">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}
