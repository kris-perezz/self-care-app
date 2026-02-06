"use client";

import { useActionState, useState } from "react";
import { createReward, type RewardActionState } from "./actions";
import { Button, Card, EmojiPicker, Field, Input } from "@/components/ui";
import { EMOJI, REWARD_EMOJI_OPTIONS } from "@/lib/emoji";

const initialState: RewardActionState = { error: null };

export function NewRewardForm() {
  const [state, formAction, isPending] = useActionState(createReward, initialState);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState<string>(EMOJI.gift);

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="ghostAccent"
        className="w-full"
      >
        + Add custom reward
      </Button>
    );
  }

  return (
    <Card variant="standard" className="space-y-3">
      <form action={formAction} className="space-y-3">
        {state.error ? (
          <div className="rounded-xl bg-warning-50 p-2 text-tiny text-warning-900">
            {state.error}
          </div>
        ) : null}

        <Field label="Reward Emoji">
          <EmojiPicker
            name="emoji"
            value={selectedEmoji}
            onChange={setSelectedEmoji}
            options={[...REWARD_EMOJI_OPTIONS]}
          />
        </Field>

        <Field label="Reward name" htmlFor="name">
          <Input id="name" name="name" type="text" required placeholder="Reward name" />
        </Field>

        <Field label="Price (USD)" htmlFor="price">
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="1"
            required
            placeholder="7.00"
          />
        </Field>

        <div className="flex gap-2">
          <Button type="submit" disabled={isPending} variant="accent" className="flex-1">
            {isPending ? "Adding..." : "Add Reward"}
          </Button>

          <Button
            type="button"
            onClick={() => setIsOpen(false)}
            variant="secondary"
            className="px-5"
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
