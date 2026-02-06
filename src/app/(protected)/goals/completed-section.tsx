"use client";

import { useState } from "react";
import { GoalCard } from "./goal-card";
import type { Goal } from "@/types";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";

export function CompletedSection({ goals }: { goals: Goal[] }) {
  const [isOpen, setIsOpen] = useState(false);

  if (goals.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-2 py-2 text-small text-neutral-700/70"
      >
        <CaretRight
          size={16}
          weight="bold"
          className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
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
