"use client";

import { useActionState } from "react";
import { updateProfile, type SettingsActionState } from "./actions";
import type { UserProfile } from "@/types";
import { Button, Card, Field, Input, Select } from "@/components/ui";

const TIMEZONE_OPTIONS = [
  { group: "Americas", zones: [
    { value: "America/New_York", label: "Eastern (New York)" },
    { value: "America/Chicago", label: "Central (Chicago)" },
    { value: "America/Denver", label: "Mountain (Denver)" },
    { value: "America/Los_Angeles", label: "Pacific (Los Angeles)" },
    { value: "America/Anchorage", label: "Alaska (Anchorage)" },
    { value: "America/Toronto", label: "Eastern (Toronto)" },
    { value: "America/Edmonton", label: "Mountain (Edmonton)" },
    { value: "America/Vancouver", label: "Pacific (Vancouver)" },
    { value: "America/Winnipeg", label: "Central (Winnipeg)" },
    { value: "America/Halifax", label: "Atlantic (Halifax)" },
    { value: "America/St_Johns", label: "Newfoundland (St. John's)" },
    { value: "America/Mexico_City", label: "Central (Mexico City)" },
    { value: "America/Sao_Paulo", label: "Brasília (São Paulo)" },
    { value: "America/Argentina/Buenos_Aires", label: "Argentina (Buenos Aires)" },
  ]},
  { group: "Europe", zones: [
    { value: "Europe/London", label: "GMT (London)" },
    { value: "Europe/Paris", label: "CET (Paris)" },
    { value: "Europe/Berlin", label: "CET (Berlin)" },
    { value: "Europe/Madrid", label: "CET (Madrid)" },
    { value: "Europe/Rome", label: "CET (Rome)" },
    { value: "Europe/Amsterdam", label: "CET (Amsterdam)" },
    { value: "Europe/Stockholm", label: "CET (Stockholm)" },
    { value: "Europe/Moscow", label: "MSK (Moscow)" },
  ]},
  { group: "Asia", zones: [
    { value: "Asia/Tokyo", label: "JST (Tokyo)" },
    { value: "Asia/Shanghai", label: "CST (Shanghai)" },
    { value: "Asia/Hong_Kong", label: "HKT (Hong Kong)" },
    { value: "Asia/Seoul", label: "KST (Seoul)" },
    { value: "Asia/Singapore", label: "SGT (Singapore)" },
    { value: "Asia/Kolkata", label: "IST (Kolkata)" },
    { value: "Asia/Dubai", label: "GST (Dubai)" },
  ]},
  { group: "Pacific & Australia", zones: [
    { value: "Australia/Sydney", label: "AEST (Sydney)" },
    { value: "Australia/Melbourne", label: "AEST (Melbourne)" },
    { value: "Australia/Perth", label: "AWST (Perth)" },
    { value: "Pacific/Auckland", label: "NZST (Auckland)" },
    { value: "Pacific/Honolulu", label: "HST (Honolulu)" },
  ]},
];

const initialState: SettingsActionState = { error: null, success: false };

export function SettingsForm({ profile }: { profile: UserProfile }) {
  const [state, formAction, isPending] = useActionState(
    updateProfile,
    initialState
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-2xl bg-warning-50 p-3 text-small text-warning-900">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-2xl bg-success-100 p-3 text-small text-success-700">
          Settings saved!
        </div>
      )}

      {/* Email (read-only) */}
      <Field label="Email">
        <Card variant="muted" className="text-small text-neutral-700/70">
          {profile.email}
        </Card>
      </Field>

      {/* Display Name */}
      <Field htmlFor="display_name" label="Display Name">
        <Input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={profile.display_name ?? ""}
          maxLength={50}
          placeholder="What should we call you?"
        />
      </Field>

      {/* Timezone */}
      <Field htmlFor="timezone" label="Timezone">
        <Select
          id="timezone"
          name="timezone"
          defaultValue={profile.timezone}
        >
          {TIMEZONE_OPTIONS.map((group) => (
            <optgroup key={group.group} label={group.group}>
              {group.zones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </Field>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
