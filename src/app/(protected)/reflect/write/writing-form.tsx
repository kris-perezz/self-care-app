"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { saveReflection, type ReflectActionState } from "../actions";
import { formatCurrency } from "@/lib/currency";
import { calculateReflectionEarnings } from "@/lib/writing-prompts";
import { Button, FluentEmoji, Textarea } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

const MILESTONES = [
  { words: 25,  msg: "Keep going",      emoji: EMOJI.sparkles,   border: false },
  { words: 60,  msg: "You're in flow",  emoji: EMOJI.waterWave,  border: true  },
  { words: 110, msg: "Deep reflection", emoji: EMOJI.greenHeart, border: true  },
];

const AFFIRMATIONS = [
  "Reflection takes courage.",
  "You showed up for yourself today.",
  "Words become wisdom.",
  "Every entry is an act of self-love.",
  "You are worth the time you give yourself.",
  "Naming feelings is how we begin to heal.",
  "You're doing the quiet, important work.",
  "This moment belongs only to you.",
  "Showing up is already the hard part.",
  "You matter more than you know.",
  "Growth happens in the writing.",
  "You gave yourself a gift today.",
  "Honesty with yourself is a superpower.",
  "Even small words carry big meaning.",
  "You turned inward — that's brave.",
  "This is your story, told by you.",
  "Presence is a practice. You practiced.",
  "Softness toward yourself is strength.",
  "You chose to reflect. That's everything.",
  "The page held space for you today.",
];

const initialState: ReflectActionState = { error: null };

export function WritingForm({
  type,
  prompt,
}: {
  type: string;
  prompt: string | null;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(saveReflection, initialState);
  const [wordCount, setWordCount] = useState(0);
  const [milestone, setMilestone] = useState<{ msg: string; emoji: string } | null>(null);
  const milestoneTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedMilestones = useRef<Set<number>>(new Set());
  const [affirmationIndex] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const words = e.target.value.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);

    // Fire each milestone exactly once when first crossed
    for (const m of MILESTONES) {
      if (words >= m.words && !firedMilestones.current.has(m.words)) {
        firedMilestones.current.add(m.words);
        setMilestone({ msg: m.msg, emoji: m.emoji });
        if (milestoneTimer.current) clearTimeout(milestoneTimer.current);
        milestoneTimer.current = setTimeout(() => setMilestone(null), 2000);
        // Show the highest newly-crossed milestone (last one wins in loop order)
      }
    }
  }

  useEffect(() => {
    if (state.success) {
      const t = setTimeout(() => router.push("/reflect"), 4000);
      return () => clearTimeout(t);
    }
  }, [state.success, router]);

  const estimatedEarnings = calculateReflectionEarnings(wordCount);

  const textareaRingClass =
    wordCount >= 110
      ? "ring-2 ring-primary-500"
      : wordCount >= 60
        ? "ring-2 ring-primary-400"
        : "";

  if (state.success) {
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-50/95 backdrop-blur-sm"
        onClick={() => router.push("/reflect")}
      >
        <p className="font-heading max-w-xs px-8 text-center text-2xl font-semibold italic text-neutral-900">
          {AFFIRMATIONS[affirmationIndex]}
        </p>
        <p className="mt-4 text-base font-semibold text-primary-700">
          +{formatCurrency(state.earned ?? 0)} earned
        </p>
        <p className="mt-8 text-tiny text-neutral-400">Tap anywhere to continue →</p>
      </div>
    );
  }

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
        className={`leading-relaxed transition-all duration-300 ${textareaRingClass}`}
        placeholder={type === "prompted" ? "Start writing your thoughts..." : "What's on your mind?"}
      />

      <div className="flex items-center justify-between text-tiny text-neutral-700/70">
        <span className="flex items-center gap-2">
          <span>{wordCount} words</span>
          {milestone && (
            <span className="animate-milestone-pulse inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-0.5 text-tiny font-semibold text-primary-700">
              <FluentEmoji emoji={milestone.emoji} size={14} />
              {milestone.msg}
            </span>
          )}
        </span>
        <span>Earn: {formatCurrency(estimatedEarnings)}</span>
      </div>

      <Button type="submit" disabled={isPending || wordCount === 0} className="w-full">
        {isPending ? "Saving..." : "Save Reflection"}
      </Button>
    </form>
  );
}
