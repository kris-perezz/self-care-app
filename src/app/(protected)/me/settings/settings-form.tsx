"use client";

import { useActionState } from "react";
import { updateProfile, type SettingsActionState } from "./actions";
import type { UserProfile } from "@/types";

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
        <div className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-2xl bg-primary/10 p-3 text-sm text-primary-dark">
          Settings saved!
        </div>
      )}

      {/* Email (read-only) */}
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Email
        </label>
        <p className="rounded-2xl border-2 border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          {profile.email}
        </p>
      </div>

      {/* Display Name */}
      <div>
        <label
          htmlFor="display_name"
          className="mb-1 block text-xs font-medium text-gray-500"
        >
          Display Name
        </label>
        <input
          id="display_name"
          name="display_name"
          type="text"
          defaultValue={profile.display_name ?? ""}
          maxLength={50}
          className="block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
          placeholder="What should we call you?"
        />
      </div>

      {/* Timezone */}
      <div>
        <label
          htmlFor="timezone"
          className="mb-1 block text-xs font-medium text-gray-500"
        >
          Timezone
        </label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={profile.timezone}
          className="block w-full rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none"
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
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
