"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowClockwise, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { getRandomPrompts } from "@/lib/writing-prompts";
import { Button, Card } from "@/components/ui";

export function WritingPrompts() {
  const [prompts, setPrompts] = useState(() => getRandomPrompts(4));

  function shuffle() {
    setPrompts(getRandomPrompts(4));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="heading-section text-neutral-900">Writing prompts</h3>
        <Button onClick={shuffle} variant="secondary" size="sm" className="gap-2.5">
          <ArrowClockwise size={14} weight="bold" />
          Shuffle
        </Button>
      </div>

      <div className="space-y-2">
        {prompts.map((prompt, i) => (
          <Link
            key={`${prompt}-${i}`}
            href={`/reflect/write?type=prompted&prompt=${encodeURIComponent(prompt)}`}
          >
            <Card
              variant="standard"
              interactive
              className="flex items-center justify-between p-3.5"
            >
              <span className="text-body text-neutral-900">{prompt}</span>
              <CaretRight size={16} weight="bold" className="shrink-0 text-neutral-700/70" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
