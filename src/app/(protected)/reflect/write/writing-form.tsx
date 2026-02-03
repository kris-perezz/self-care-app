"use client";

import { useActionState, useState } from "react";
import { saveReflection, type ReflectActionState } from "../actions";
import { formatCurrency } from "@/lib/currency";
import { calculateReflectionEarnings } from "@/lib/writing-prompts";

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
      {prompt && <input type="hidden" name="prompt" value={prompt} />}

      {state.error && (
        <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <textarea
        name="content"
        rows={12}
        onChange={handleChange}
        className="block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed focus:border-primary focus:outline-none"
        placeholder={
          type === "prompted"
            ? "Start writing your thoughts..."
            : "What's on your mind?"
        }
      />

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{wordCount} words</span>
        <span>Earn: {formatCurrency(estimatedEarnings)}</span>
      </div>

      <button
        type="submit"
        disabled={isPending || wordCount === 0}
        className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Reflection"}
      </button>
    </form>
  );
}
