"use client";

import { useActionState } from "react";
import { logWeight, type WeightActionState } from "./actions";
import { Button, Card, Field, Input } from "@/components/ui";

const initialState: WeightActionState = { error: null, success: false };

interface WeightLogFormProps {
  today: string;
  todayWeight: number | null;
}

export function WeightLogForm({ today, todayWeight }: WeightLogFormProps) {
  const [state, formAction, isPending] = useActionState(logWeight, initialState);

  return (
    <Card variant="tintPrimary">
      <form action={formAction} className="space-y-3">
        <input type="hidden" name="logged_date" value={today} />

        {state.error && (
          <p className="rounded-xl bg-warning-50 px-3 py-2 text-small text-warning-900">
            {state.error}
          </p>
        )}

        <Field htmlFor="weight_lbs" label="Today's weight (lbs)">
          <Input
            id="weight_lbs"
            name="weight_lbs"
            type="number"
            step="0.1"
            min="1"
            max="999"
            defaultValue={todayWeight ?? ""}
            placeholder="e.g. 160.5"
            inputMode="decimal"
          />
        </Field>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Saving..." : todayWeight ? "Update" : "Log"}
        </Button>
      </form>
    </Card>
  );
}
