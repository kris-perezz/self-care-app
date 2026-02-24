"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/currency";
import { getMoodEmoji } from "@/lib/moods";
import type { Reflection } from "@/types";
import { Badge, Card, FluentEmoji } from "@/components/ui";

export function ReflectionCard({ reflection }: { reflection: Reflection }) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(reflection.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (reflection.type === "mood") {
    return (
      <Card variant="standard">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FluentEmoji emoji={getMoodEmoji(reflection.mood)} size={20} />
            <span className="text-small capitalize text-neutral-700">{reflection.mood}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-tiny text-neutral-700/70">{date}</span>
            <span className="text-tiny font-medium text-neutral-900">
              +{formatCurrency(reflection.currency_earned)}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  const preview =
    reflection.content.length > 120 ? reflection.content.slice(0, 120) + "..." : reflection.content;

  return (
    <Card variant="standard">
      <div className="mb-2 flex items-center justify-between">
        <Badge variant="status" statusColor="accent">
          {reflection.type === "prompted" ? "Prompted" : "Freewrite"}
        </Badge>
        <span className="text-tiny text-neutral-700/70">{date}</span>
      </div>

      {reflection.prompt ? (
        <p className="mb-1 text-tiny italic text-neutral-700">{reflection.prompt}</p>
      ) : null}

      <p className="whitespace-pre-wrap text-small leading-relaxed text-neutral-700">
        {expanded ? reflection.content : preview}
      </p>

      {reflection.content.length > 120 ? (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-tiny font-medium text-primary-700 hover:text-primary-500"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      ) : null}

      <div className="mt-2 flex items-center justify-between text-tiny text-neutral-700/70">
        <span>{reflection.word_count} words</span>
        <span className="text-neutral-900">+{formatCurrency(reflection.currency_earned)}</span>
      </div>
    </Card>
  );
}
