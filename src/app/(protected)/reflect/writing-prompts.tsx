"use client";

import { useState } from "react";
import Link from "next/link";
import { getRandomPrompts } from "@/lib/writing-prompts";

export function WritingPrompts() {
  const [prompts, setPrompts] = useState(() => getRandomPrompts(4));

  function shuffle() {
    setPrompts(getRandomPrompts(4));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Writing prompts</h3>
        <button
          onClick={shuffle}
          className="flex items-center gap-1 rounded-xl bg-primary/20 px-3 py-1 text-xs font-medium text-primary-dark hover:bg-primary/30"
        >
          <ShuffleIcon />
          Shuffle
        </button>
      </div>

      <div className="space-y-2">
        {prompts.map((prompt, i) => (
          <Link
            key={`${prompt}-${i}`}
            href={`/reflect/write?type=prompted&prompt=${encodeURIComponent(prompt)}`}
            className="flex items-center justify-between rounded-2xl border-2 border-gray-200 bg-white p-3.5 text-sm text-gray-700 hover:border-primary"
          >
            <span>{prompt}</span>
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ShuffleIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
    </svg>
  );
}
