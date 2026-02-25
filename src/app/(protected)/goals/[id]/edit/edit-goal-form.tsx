"use client";

import { useActionState, useState, useTransition } from "react";
import { updateGoal, deleteGoal, type ActionState } from "../../actions";
import { DIFFICULTY_REWARDS, formatCurrency } from "@/lib/currency";
import type { Goal } from "@/types";
import {
  Badge,
  Button,
  EmojiPicker,
  Field,
  Textarea,
  Input,
} from "@/components/ui";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { DayPicker } from "../../day-picker";
import { EMOJI, GOAL_EMOJI_OPTIONS } from "@/lib/emoji";

const initialState: ActionState = { error: null };

export function EditGoalForm({ goal }: { goal: Goal }) {
  const updateGoalWithId = updateGoal.bind(null, goal.id);
  const [state, formAction, isPending] = useActionState(updateGoalWithId, initialState);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(goal.difficulty);
  const [scheduledDate, setScheduledDate] = useState<string | null>(goal.scheduled_date);
  const [scheduledTime, setScheduledTime] = useState<string | null>(goal.scheduled_time);
  const [emoji, setEmoji] = useState<string>(goal.emoji || EMOJI.target);
  const [isRecurring, setIsRecurring] = useState((goal.recurring_days?.length ?? 0) > 0);

  function handleDelete() {
    startDeleteTransition(() => {
      void deleteGoal(goal.id);
    });
  }

  return (
    <div className="space-y-6">
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
          <Input id="title" name="title" type="text" required defaultValue={goal.title} />
        </Field>

        <Field label="Description" htmlFor="description" hint="(optional)">
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={goal.description ?? ""}
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
          <DayPicker
            initialDays={goal.recurring_days}
            onHasSelection={setIsRecurring}
          />
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
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <div className="border-t border-neutral-100 pt-4">
        {!showDeleteConfirm ? (
          <Button
            variant="destructiveOutline"
            className="w-full"
            onClick={() => setShowDeleteConfirm(true)}
          >
            Delete Goal
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-small text-neutral-700/70">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3">
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                variant="destructiveOutline"
                className="flex-1 border-warning-900 bg-warning-900 text-white"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
