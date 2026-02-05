"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { getMoodEmoji } from "@/lib/moods";
import type { Reflection } from "@/types";

export function ReflectionCard({ reflection }: { reflection: Reflection }) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(reflection.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (reflection.type === "mood") {
    return (
      <div className="rounded-2xl border-2 border-gray-100 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getMoodEmoji(reflection.mood)}
            </span>
            <span className="text-sm font-medium capitalize text-gray-700">
              {reflection.mood}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{date}</span>
            <span className="text-xs font-medium text-primary-dark">
              +{formatCurrency(reflection.currency_earned)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  const preview =
    reflection.content.length > 120
      ? reflection.content.slice(0, 120) + "..."
      : reflection.content;

  return (
    <div className="rounded-2xl border-2 border-gray-100 bg-white p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-xl bg-pink/20 px-2 py-0.5 text-xs font-medium text-pink-800">
          {reflection.type === "prompted" ? "Prompted" : "Freewrite"}
        </span>
        <span className="text-xs text-gray-400">{date}</span>
      </div>

      {reflection.prompt && (
        <p className="mb-1 text-xs italic text-gray-500">
          {reflection.prompt}
        </p>
      )}

      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
        {expanded ? reflection.content : preview}
      </p>

      {reflection.content.length > 120 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs font-medium text-primary-dark hover:text-primary"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>{reflection.word_count} words</span>
        <span className="text-primary-dark">
          +{formatCurrency(reflection.currency_earned)}
        </span>
      </div>
    </div>
  );
}
