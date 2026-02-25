"use client";

import { useState } from "react";
import Link from "next/link";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { Card } from "@/components/ui";

interface Props {
  categories: string[];
  promptsByCategory: Record<string, string[]>;
}

export function PromptsBrowser({ categories, promptsByCategory }: Props) {
  const [active, setActive] = useState<string>("All");

  const visiblePrompts =
    active === "All"
      ? Object.entries(promptsByCategory)
      : [[active, promptsByCategory[active]] as [string, string[]]];

  return (
    <div className="space-y-4">
      {/* Category filter pills */}
      <div
        className="overflow-x-auto pb-1 no-scrollbar -mx-4"
        style={{ maskImage: "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)" }}
      >
        <div className="flex gap-2 py-1 px-4">
        {["All", ...categories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={[
              "ui-compact-pill interactive-button shrink-0 h-8 rounded-3xl px-4 text-[12px] font-semibold shadow-button",
              active === cat
                ? "bg-primary-500 text-white"
                : "bg-neutral-100 text-neutral-700",
            ].join(" ")}
          >
            <span className="ui-compact-label">{cat}</span>
          </button>
        ))}
        </div>
      </div>

      {/* Prompt list grouped by category */}
      <div className="space-y-5">
        {visiblePrompts.map(([category, prompts]) => (
          <div key={category} className="space-y-2">
            <h3 className="heading-section text-neutral-900">{category}</h3>
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
                    <CaretRight
                      size={16}
                      weight="bold"
                      className="shrink-0 text-neutral-700/70"
                    />
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
