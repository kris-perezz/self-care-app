"use client";

import { useActionState, useState } from "react";
import { saveReflection, type ReflectActionState } from "../actions";
import { formatCurrency } from "@/lib/currency";
import { calculateReflectionEarnings } from "@/lib/writing-prompts";
import { Button, Textarea } from "@/components/ui";

const initialState: ReflectActionState = { error: null };

export function WritingForm({
  type,
  prompt,
}: {
  type: string;
  prompt: string | null;
}) {
  const [state, formAction, isPending] = useActionState(saveReflection, initialState);
  const [wordCount, setWordCount] = useState(0);

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const words = e.target.value.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }

  const estimatedEarnings = calculateReflectionEarnings(wordCount);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="type" value={type} />
      {prompt ? <input type="hidden" name="prompt" value={prompt} /> : null}

      {state.error ? (
        <div className="rounded-2xl bg-warning-50 p-3 text-small text-warning-900">{state.error}</div>
      ) : null}

      <Textarea
        name="content"
        rows={12}
        onChange={handleChange}
        className="leading-relaxed"
        placeholder={type === "prompted" ? "Start writing your thoughts..." : "What's on your mind?"}
      />

      <div className="flex items-center justify-between text-tiny text-neutral-700/70">
        <span>{wordCount} words</span>
        <span>Earn: {formatCurrency(estimatedEarnings)}</span>
      </div>

      <Button type="submit" disabled={isPending || wordCount === 0} className="w-full">
        {isPending ? "Saving..." : "Save Reflection"}
      </Button>
    </form>
  );
}
