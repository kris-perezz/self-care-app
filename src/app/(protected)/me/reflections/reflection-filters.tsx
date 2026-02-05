"use client";

import { useState } from "react";
import { FilterButton } from "@/components/filter-button";
import { ReflectionCard } from "./reflection-card";
import type { Reflection } from "@/types";

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
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search reflections..."
        className="w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
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

      <p className="text-xs text-gray-500">
        {filtered.length} reflection{filtered.length !== 1 ? "s" : ""}
      </p>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((r) => (
            <ReflectionCard key={r.id} reflection={r} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center">
          <p className="text-sm text-gray-500">
            No reflections match your search.
          </p>
        </div>
      )}
    </div>
  );
}
