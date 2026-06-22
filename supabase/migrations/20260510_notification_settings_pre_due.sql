-- Move pre-due reminders from per-goal to a global notification setting
ALTER TABLE public.notification_settings
  ADD COLUMN IF NOT EXISTS pre_due_reminders_enabled boolean DEFAULT false NOT NULL;
