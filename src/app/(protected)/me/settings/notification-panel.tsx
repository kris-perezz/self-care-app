"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  savePushSubscription,
  deletePushSubscription,
  saveNotificationSettings,
  type NotifSettingsState,
} from "./actions";
import type { NotificationSettings } from "@/types";
import { Button, Card, Field } from "@/components/ui";
import { TimePicker } from "@/components/ui/time-picker";
import {
  isStandalone,
  registerServiceWorker,
  subscribeToPush,
  getExistingSubscription,
} from "@/lib/notifications";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

const initialFormState: NotifSettingsState = { error: null, success: false };

const DEFAULTS: Omit<NotificationSettings, "user_id" | "enabled" | "updated_at"> = {
  daily_summary_enabled: true,
  daily_summary_time: "08:00",
  at_time_reminders_enabled: true,
  overdue_reminders_enabled: true,
  streak_at_risk_enabled: true,
  streak_at_risk_time: "21:00",
  reflection_reminder_enabled: true,
  reflection_reminder_time: "20:00",
  mood_reminder_enabled: true,
  mood_reminder_time: "12:00",
};

function Toggle({
  name,
  checked,
  onChange,
  label,
}: {
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <input type="hidden" name={name} value={String(checked)} />
      <span className="text-small text-neutral-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 ${
          checked ? "bg-primary-500" : "bg-neutral-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function SettingsRow({
  name,
  checked,
  onChange,
  label,
  timeName,
  timeValue,
  onTimeChange,
}: {
  name: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  timeName?: string;
  timeValue?: string | null;
  onTimeChange?: (v: string | null) => void;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
      <Toggle name={name} checked={checked} onChange={onChange} label={label} />
      {timeName && timeValue !== undefined && onTimeChange && checked && (
        <TimePicker
          name={timeName}
          value={timeValue}
          onChange={onTimeChange}
          minuteStep={15}
        />
      )}
    </div>
  );
}

export function NotificationPanel({
  notificationSettings,
  hasSubscription,
}: {
  notificationSettings: NotificationSettings | null;
  hasSubscription: boolean;
}) {
  const s = notificationSettings;

  const [isSubscribed, setIsSubscribed] = useState(
    hasSubscription && (s?.enabled ?? false)
  );
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [isSubscribing, startSubscribeTransition] = useTransition();
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    registerServiceWorker();
  }, []);

  // Settings form state
  const [dailySummary, setDailySummary] = useState(s?.daily_summary_enabled ?? DEFAULTS.daily_summary_enabled);
  const [dailySummaryTime, setDailySummaryTime] = useState<string | null>(s?.daily_summary_time ?? DEFAULTS.daily_summary_time);
  const [atTime, setAtTime] = useState(s?.at_time_reminders_enabled ?? DEFAULTS.at_time_reminders_enabled);
  const [overdue, setOverdue] = useState(s?.overdue_reminders_enabled ?? DEFAULTS.overdue_reminders_enabled);
  const [streakRisk, setStreakRisk] = useState(s?.streak_at_risk_enabled ?? DEFAULTS.streak_at_risk_enabled);
  const [streakRiskTime, setStreakRiskTime] = useState<string | null>(s?.streak_at_risk_time ?? DEFAULTS.streak_at_risk_time);
  const [reflection, setReflection] = useState(s?.reflection_reminder_enabled ?? DEFAULTS.reflection_reminder_enabled);
  const [reflectionTime, setReflectionTime] = useState<string | null>(s?.reflection_reminder_time ?? DEFAULTS.reflection_reminder_time);
  const [mood, setMood] = useState(s?.mood_reminder_enabled ?? DEFAULTS.mood_reminder_enabled);
  const [moodTime, setMoodTime] = useState<string | null>(s?.mood_reminder_time ?? DEFAULTS.mood_reminder_time);

  const [formState, formAction, isFormPending] = useActionState(saveNotificationSettings, initialFormState);

  async function handleEnable() {
    setSubscribeError(null);
    if (!("Notification" in window)) {
      setSubscribeError("Notifications are not supported in this browser.");
      return;
    }
    if (!standalone) {
      setSubscribeError(
        'On iPhone/iPad, tap the share icon in Safari and choose "Add to Home Screen" first, then enable notifications.'
      );
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setSubscribeError("Permission denied. Enable notifications in your device settings.");
      return;
    }
    if (!VAPID_PUBLIC_KEY) {
      setSubscribeError("Push notifications are not configured yet.");
      return;
    }
    startSubscribeTransition(async () => {
      try {
        const subscription = await subscribeToPush(VAPID_PUBLIC_KEY);
        if (!subscription) throw new Error("Subscription failed");
        const json = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
        const result = await savePushSubscription(json);
        if (result.error) { setSubscribeError(result.error); return; }
        setIsSubscribed(true);
      } catch (e) {
        setSubscribeError(e instanceof Error ? e.message : "Failed to enable notifications");
      }
    });
  }

  async function handleDisable() {
    startSubscribeTransition(async () => {
      try {
        const existing = await getExistingSubscription();
        if (existing) {
          await existing.unsubscribe();
          await deletePushSubscription(existing.endpoint);
        }
        setIsSubscribed(false);
      } catch {
        setSubscribeError("Failed to disable notifications.");
      }
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-body font-semibold text-neutral-900">Notifications</h2>

      {/* Master enable/disable */}
      <Card variant="standard" className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-small font-medium text-neutral-900">
              {isSubscribed ? "Enabled on this device" : "Enable push notifications"}
            </p>
            <p className="text-tiny text-neutral-500">
              {isSubscribed
                ? "You'll receive reminders for goals, streaks, and more."
                : "Get reminders for goals, streaks, reflections, and mood."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isSubscribed}
            onClick={isSubscribed ? handleDisable : handleEnable}
            disabled={isSubscribing}
            className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 disabled:opacity-60 ${
              isSubscribed ? "bg-primary-500" : "bg-neutral-200"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                isSubscribed ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {subscribeError && (
          <p className="text-tiny text-warning-700">{subscribeError}</p>
        )}

        {!isSubscribed && !standalone && "Notification" in (typeof window !== "undefined" ? window : {}) && (
          <p className="text-tiny text-neutral-400">
            On iPhone/iPad, add Himo to your Home Screen first to enable notifications.
          </p>
        )}
      </Card>

      {/* Settings form — only shown when subscribed */}
      {isSubscribed && (
        <form action={formAction} className="space-y-3">
          {formState.error && (
            <p className="rounded-2xl bg-warning-50 p-3 text-small text-warning-900">
              {formState.error}
            </p>
          )}
          {formState.success && (
            <p className="rounded-2xl bg-success-100 p-3 text-small text-success-700">
              Notification settings saved!
            </p>
          )}

          <p className="text-tiny font-medium uppercase tracking-wide text-neutral-400">
            Goals
          </p>
          <SettingsRow
            name="at_time_reminders_enabled"
            checked={atTime}
            onChange={setAtTime}
            label="At-time reminders"
          />
          <SettingsRow
            name="overdue_reminders_enabled"
            checked={overdue}
            onChange={setOverdue}
            label="Overdue reminders"
          />

          <p className="pt-1 text-tiny font-medium uppercase tracking-wide text-neutral-400">
            Daily
          </p>
          <SettingsRow
            name="daily_summary_enabled"
            checked={dailySummary}
            onChange={setDailySummary}
            label="Daily summary"
            timeName="daily_summary_time"
            timeValue={dailySummaryTime}
            onTimeChange={setDailySummaryTime}
          />
          <SettingsRow
            name="streak_at_risk_enabled"
            checked={streakRisk}
            onChange={setStreakRisk}
            label="Streak at risk"
            timeName="streak_at_risk_time"
            timeValue={streakRiskTime}
            onTimeChange={setStreakRiskTime}
          />

          <p className="pt-1 text-tiny font-medium uppercase tracking-wide text-neutral-400">
            Reflect
          </p>
          <SettingsRow
            name="reflection_reminder_enabled"
            checked={reflection}
            onChange={setReflection}
            label="Reflection reminder"
            timeName="reflection_reminder_time"
            timeValue={reflectionTime}
            onTimeChange={setReflectionTime}
          />
          <SettingsRow
            name="mood_reminder_enabled"
            checked={mood}
            onChange={setMood}
            label="Mood check-in reminder"
            timeName="mood_reminder_time"
            timeValue={moodTime}
            onTimeChange={setMoodTime}
          />

          {/* Hidden fields for non-time toggles that don't pass through SettingsRow timeName */}
          <Field label="">
            <Button type="submit" disabled={isFormPending} className="w-full">
              {isFormPending ? "Saving..." : "Save Notification Settings"}
            </Button>
          </Field>
        </form>
      )}
    </div>
  );
}
