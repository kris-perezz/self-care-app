"use client";

import { useActionState, useEffect, useMemo, useState, useTransition } from "react";
import {
  savePushSubscription,
  deletePushSubscription,
  saveNotificationSettings,
  type NotifSettingsState,
} from "./actions";
import type { NotificationSettings } from "@/types";
import { Button, Card, Field, Toggle } from "@/components/ui";
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
  pre_due_reminders_enabled: false,
  streak_at_risk_enabled: true,
  streak_at_risk_time: "21:00",
  reflection_reminder_enabled: true,
  reflection_reminder_time: "20:00",
  mood_reminder_enabled: true,
  mood_reminder_time: "12:00",
};

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
      <div className="flex items-center justify-between gap-3">
        <input type="hidden" name={name} value={String(checked)} />
        <span className="text-small text-neutral-700">{label}</span>
        <Toggle checked={checked} onChange={onChange} aria-label={label} />
      </div>
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
  const [togglePending, setTogglePending] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);
  const [isSubscribing, startSubscribeTransition] = useTransition();
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    registerServiceWorker();
  }, []);

  const [dailySummary, setDailySummary] = useState(s?.daily_summary_enabled ?? DEFAULTS.daily_summary_enabled);
  const [dailySummaryTime, setDailySummaryTime] = useState<string | null>(s?.daily_summary_time ?? DEFAULTS.daily_summary_time);
  const [atTime, setAtTime] = useState(s?.at_time_reminders_enabled ?? DEFAULTS.at_time_reminders_enabled);
  const [overdue, setOverdue] = useState(s?.overdue_reminders_enabled ?? DEFAULTS.overdue_reminders_enabled);
  const [preDue, setPreDue] = useState(s?.pre_due_reminders_enabled ?? DEFAULTS.pre_due_reminders_enabled);
  const [streakRisk, setStreakRisk] = useState(s?.streak_at_risk_enabled ?? DEFAULTS.streak_at_risk_enabled);
  const [streakRiskTime, setStreakRiskTime] = useState<string | null>(s?.streak_at_risk_time ?? DEFAULTS.streak_at_risk_time);
  const [reflection, setReflection] = useState(s?.reflection_reminder_enabled ?? DEFAULTS.reflection_reminder_enabled);
  const [reflectionTime, setReflectionTime] = useState<string | null>(s?.reflection_reminder_time ?? DEFAULTS.reflection_reminder_time);
  const [mood, setMood] = useState(s?.mood_reminder_enabled ?? DEFAULTS.mood_reminder_enabled);
  const [moodTime, setMoodTime] = useState<string | null>(s?.mood_reminder_time ?? DEFAULTS.mood_reminder_time);

  const [formState, formAction, isFormPending] = useActionState(saveNotificationSettings, initialFormState);

  const savedRef = useMemo(() => ({
    dailySummary: s?.daily_summary_enabled ?? DEFAULTS.daily_summary_enabled,
    dailySummaryTime: s?.daily_summary_time ?? DEFAULTS.daily_summary_time,
    atTime: s?.at_time_reminders_enabled ?? DEFAULTS.at_time_reminders_enabled,
    overdue: s?.overdue_reminders_enabled ?? DEFAULTS.overdue_reminders_enabled,
    preDue: s?.pre_due_reminders_enabled ?? DEFAULTS.pre_due_reminders_enabled,
    streakRisk: s?.streak_at_risk_enabled ?? DEFAULTS.streak_at_risk_enabled,
    streakRiskTime: s?.streak_at_risk_time ?? DEFAULTS.streak_at_risk_time,
    reflection: s?.reflection_reminder_enabled ?? DEFAULTS.reflection_reminder_enabled,
    reflectionTime: s?.reflection_reminder_time ?? DEFAULTS.reflection_reminder_time,
    mood: s?.mood_reminder_enabled ?? DEFAULTS.mood_reminder_enabled,
    moodTime: s?.mood_reminder_time ?? DEFAULTS.mood_reminder_time,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const [savedSnapshot, setSavedSnapshot] = useState(savedRef);

  useEffect(() => {
    if (formState.success) {
      setSavedSnapshot({
        dailySummary,
        dailySummaryTime: dailySummaryTime ?? DEFAULTS.daily_summary_time,
        atTime,
        overdue,
        preDue,
        streakRisk,
        streakRiskTime: streakRiskTime ?? DEFAULTS.streak_at_risk_time,
        reflection,
        reflectionTime: reflectionTime ?? DEFAULTS.reflection_reminder_time,
        mood,
        moodTime: moodTime ?? DEFAULTS.mood_reminder_time,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.success]);

  const isFormDirty =
    dailySummary !== savedSnapshot.dailySummary ||
    dailySummaryTime !== savedSnapshot.dailySummaryTime ||
    atTime !== savedSnapshot.atTime ||
    overdue !== savedSnapshot.overdue ||
    preDue !== savedSnapshot.preDue ||
    streakRisk !== savedSnapshot.streakRisk ||
    streakRiskTime !== savedSnapshot.streakRiskTime ||
    reflection !== savedSnapshot.reflection ||
    reflectionTime !== savedSnapshot.reflectionTime ||
    mood !== savedSnapshot.mood ||
    moodTime !== savedSnapshot.moodTime;

  async function handleEnable() {
    setSubscribeError(null);
    setTogglePending(true);
    if (!("Notification" in window)) {
      setSubscribeError("Notifications are not supported in this browser.");
      setTogglePending(false);
      return;
    }
    if (!standalone) {
      setSubscribeError(
        'On iPhone/iPad, tap the share icon in Safari and choose "Add to Home Screen" first, then enable notifications.'
      );
      setTogglePending(false);
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setSubscribeError("Permission denied. Enable notifications in your device settings.");
      setTogglePending(false);
      return;
    }
    if (!VAPID_PUBLIC_KEY) {
      setSubscribeError("Push notifications are not configured yet (missing VAPID key).");
      setTogglePending(false);
      return;
    }
    startSubscribeTransition(async () => {
      try {
        const subscription = await subscribeToPush(VAPID_PUBLIC_KEY);
        if (!subscription) throw new Error("Subscription failed");
        const json = subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
        const result = await savePushSubscription(json);
        if (result.error) { setSubscribeError(result.error); setTogglePending(false); return; }
        setIsSubscribed(true);
      } catch (e) {
        setSubscribeError(e instanceof Error ? e.message : "Failed to enable notifications");
      } finally {
        setTogglePending(false);
      }
    });
  }

  async function handleDisable() {
    setTogglePending(true);
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
      } finally {
        setTogglePending(false);
      }
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-body font-semibold text-neutral-900">Notifications</h2>

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
          {togglePending || isSubscribing ? (
            <span className="flex h-6 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-200">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-neutral-400 border-t-transparent" />
            </span>
          ) : (
            <Toggle
              checked={isSubscribed}
              onChange={isSubscribed ? () => handleDisable() : () => handleEnable()}
              aria-label="Enable push notifications"
            />
          )}
        </div>

        {subscribeError && (
          <p className="text-tiny text-warning-700">{subscribeError}</p>
        )}

        {!isSubscribed && !standalone && typeof window !== "undefined" && "Notification" in window && (
          <p className="text-tiny text-neutral-400">
            On iPhone/iPad, add Himo to your Home Screen first to enable notifications.
          </p>
        )}
      </Card>

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

          <p className="text-tiny font-medium uppercase tracking-wide text-neutral-400">Goals</p>
          <SettingsRow name="at_time_reminders_enabled" checked={atTime} onChange={setAtTime} label="At-time reminders" />
          <SettingsRow name="overdue_reminders_enabled" checked={overdue} onChange={setOverdue} label="Overdue reminders" />
          <SettingsRow name="pre_due_reminders_enabled" checked={preDue} onChange={setPreDue} label="Alert before due" />

          <p className="pt-1 text-tiny font-medium uppercase tracking-wide text-neutral-400">Daily</p>
          <SettingsRow name="daily_summary_enabled" checked={dailySummary} onChange={setDailySummary} label="Daily summary" timeName="daily_summary_time" timeValue={dailySummaryTime} onTimeChange={setDailySummaryTime} />
          <SettingsRow name="streak_at_risk_enabled" checked={streakRisk} onChange={setStreakRisk} label="Streak at risk" timeName="streak_at_risk_time" timeValue={streakRiskTime} onTimeChange={setStreakRiskTime} />

          <p className="pt-1 text-tiny font-medium uppercase tracking-wide text-neutral-400">Reflect</p>
          <SettingsRow name="reflection_reminder_enabled" checked={reflection} onChange={setReflection} label="Reflection reminder" timeName="reflection_reminder_time" timeValue={reflectionTime} onTimeChange={setReflectionTime} />
          <SettingsRow name="mood_reminder_enabled" checked={mood} onChange={setMood} label="Mood check-in reminder" timeName="mood_reminder_time" timeValue={moodTime} onTimeChange={setMoodTime} />

          {isFormDirty && (
            <Button type="submit" disabled={isFormPending} className="w-full">
              {isFormPending ? "Saving..." : "Save Notification Settings"}
            </Button>
          )}
        </form>
      )}
    </div>
  );
}
