"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createGoal, type ActionState } from "../actions";
import { DIFFICULTY_REWARDS, formatCurrency } from "@/lib/currency";
import {
  Badge,
  Button,
  EmojiPicker,
  Field,
  Textarea,
  Input,
} from "@/components/ui";
import { BackLink } from "@/components/nav/back-link";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { DayPicker } from "../day-picker";
import { EMOJI, GOAL_EMOJI_OPTIONS } from "@/lib/emoji";

const initialState: ActionState = { error: null, success: false };

export default function NewGoalPage() {
  const [state, formAction, isPending] = useActionState(createGoal, initialState);
  const router = useRouter();
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [scheduledDate, setScheduledDate] = useState<string | null>(null);
  const [scheduledTime, setScheduledTime] = useState<string | null>(null);
  const [emoji, setEmoji] = useState<string>(EMOJI.target);
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (state.success) {
      router.refresh();
      router.push("/goals");
    }
  }, [router, state.success]);

  return (
    <div className="space-y-6">
      <div>
        <BackLink href="/goals" />
        <h1 className="heading-large text-neutral-900">New Goal</h1>
      </div>
      <form action={formAction} className="space-y-4">
        {state.error ? (
          <div className="rounded-2xl bg-warning-50 p-3 text-small text-warning-900">
            {state.error}
          </div>
        ) : null}

        <Field label="Goal Emoji">
          <EmojiPicker name="emoji" value={emoji} onChange={setEmoji} options={[...GOAL_EMOJI_OPTIONS]} />
        </Field>

        <Field label="Title" htmlFor="title">
          <Input
            id="title"
            name="title"
            type="text"
            required
            placeholder="e.g., Drink 8 glasses of water"
          />
        </Field>

        <Field label="Description" htmlFor="description" hint="(optional)">
          <Textarea
            id="description"
            name="description"
            rows={3}
            placeholder="Add some details or motivation..."
          />
        </Field>

        <Field label="Difficulty">
          <input type="hidden" name="difficulty" value={difficulty} />
          <div className="mt-2 flex gap-2">
            {(["easy", "medium", "hard"] as const).map((level) => {
              const selected = difficulty === level;
              return (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition-colors ${
                    selected
                      ? "border-primary-500 bg-primary-50"
                      : "border-neutral-100 bg-neutral-50"
                  }`}
                >
                  <Badge variant={level}>{level.toUpperCase()}</Badge>
                  <span className="text-tiny text-neutral-700/70">
                    {formatCurrency(DIFFICULTY_REWARDS[level])}
                  </span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Recurring days" hint="(optional)">
          <DayPicker onHasSelection={setIsRecurring} />
        </Field>

        {!isRecurring && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Date" hint="(optional)" className="min-w-0">
              <DatePicker
                name="scheduled_date"
                value={scheduledDate}
                onChange={setScheduledDate}
              />
            </Field>

            <Field label="Time" hint="(optional)" className="min-w-0">
              <TimePicker
                name="scheduled_time"
                value={scheduledTime}
                onChange={setScheduledTime}
              />
            </Field>
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating..." : "Create Goal"}
        </Button>
      </form>
    </div>
  );
}
