"use client";

import { useState } from "react";
import { FilterButton } from "@/components/filter-button";
import { ReflectionCard } from "./reflection-card";
import type { Reflection } from "@/types";
import { EmptyState, Input } from "@/components/ui";

type TypeFilter = "all" | "mood" | "prompted" | "freewrite";

export function ReflectionFilters({
  reflections,
}: {
  reflections: Reflection[];
}) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = reflections.filter((r) => {
    if (typeFilter !== "all" && r.type !== typeFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const inContent = r.content.toLowerCase().includes(q);
      const inPrompt = r.prompt?.toLowerCase().includes(q) ?? false;
      const inMood = r.mood?.toLowerCase().includes(q) ?? false;
      if (!inContent && !inPrompt && !inMood) return false;
    }

    return true;
  });

  return (
    <div className="space-y-3">
      <Input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search reflections..."
      />

      <div className="flex gap-2">
        {(["all", "mood", "prompted", "freewrite"] as const).map((t) => (
          <FilterButton
            key={t}
            active={typeFilter === t}
            onClick={() => setTypeFilter(t)}
          >
            {t === "all"
              ? "All"
              : t === "mood"
                ? "Mood"
                : t === "prompted"
                  ? "Prompted"
                  : "Freewrite"}
          </FilterButton>
        ))}
      </div>

      <p className="text-tiny text-neutral-700/70">
        {filtered.length} reflection{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((r) => (
            <ReflectionCard key={r.id} reflection={r} />
          ))}
        </div>
      ) : (
        <EmptyState message="No reflections match your search." />
      )}
    </div>
  );
}
