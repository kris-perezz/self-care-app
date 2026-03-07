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
        className="flex w-full items-center gap-2 py-3 text-small text-neutral-700/70"
      >
        <CaretRight
          size={16}
          weight="bold"
          className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
        Completed ({goals.length})
      </button>
      <div className={`grid transition-all duration-200 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="space-y-3 pt-1">
            {goals.map((goal) => (
              <GoalCard key={goal.id} goal={goal} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
