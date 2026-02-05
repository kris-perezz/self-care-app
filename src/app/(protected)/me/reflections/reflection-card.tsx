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
      <div className="rounded-2xl border-2 border-neutral-100 bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getMoodEmoji(reflection.mood)}
            </span>
            <span className="text-small capitalize text-neutral-700">
              {reflection.mood}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-tiny text-neutral-500">{date}</span>
            <span className="text-tiny font-medium text-primary-700">
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
    <div className="rounded-2xl border-2 border-neutral-100 bg-white p-4 shadow-card">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-xl bg-accent-100 px-2 py-0.5 text-tiny text-accent-900">
          {reflection.type === "prompted" ? "Prompted" : "Freewrite"}
        </span>
        <span className="text-tiny text-neutral-500">{date}</span>
      </div>

      {reflection.prompt && (
        <p className="mb-1 text-tiny italic text-neutral-700">
          {reflection.prompt}
        </p>
      )}

      <p className="whitespace-pre-wrap text-small leading-relaxed text-neutral-700">
        {expanded ? reflection.content : preview}
      </p>

      {reflection.content.length > 120 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-tiny font-medium text-primary-700 hover:text-primary-500"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}

      <div className="mt-2 flex items-center justify-between text-tiny text-neutral-500">
        <span>{reflection.word_count} words</span>
        <span className="text-primary-700">
          +{formatCurrency(reflection.currency_earned)}
        </span>
      </div>
    </div>
  );
}
