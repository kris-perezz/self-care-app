-- Push subscriptions (one per device per user)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push subscriptions" ON public.push_subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Notification settings (one row per user, upserted on first enable)
CREATE TABLE IF NOT EXISTS public.notification_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean DEFAULT false NOT NULL,
  daily_summary_enabled boolean DEFAULT true NOT NULL,
  daily_summary_time time DEFAULT '08:00' NOT NULL,
  at_time_reminders_enabled boolean DEFAULT true NOT NULL,
  overdue_reminders_enabled boolean DEFAULT true NOT NULL,
  streak_at_risk_enabled boolean DEFAULT true NOT NULL,
  streak_at_risk_time time DEFAULT '21:00' NOT NULL,
  reflection_reminder_enabled boolean DEFAULT true NOT NULL,
  reflection_reminder_time time DEFAULT '20:00' NOT NULL,
  mood_reminder_enabled boolean DEFAULT true NOT NULL,
  mood_reminder_time time DEFAULT '12:00' NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notification settings" ON public.notification_settings
  FOR ALL USING (auth.uid() = user_id);

-- Per-goal pre-due reminder toggle
ALTER TABLE public.goals
  ADD COLUMN IF NOT EXISTS pre_due_reminders_enabled boolean DEFAULT false NOT NULL;

-- Notification dedup log (prevents double-sends within a 15-min window)
CREATE TABLE IF NOT EXISTS public.notification_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  reference_id text NOT NULL,
  window_key text NOT NULL,
  sent_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(user_id, type, reference_id, window_key)
);
ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notification log" ON public.notification_log
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================
-- SETUP INSTRUCTIONS (run manually in Supabase SQL editor)
-- ============================================================
--
-- 1. Enable pg_cron and pg_net extensions in Supabase Dashboard
--    > Database > Extensions > search "pg_cron" and "pg_net" > enable both
--
-- 2. Generate VAPID keys and add as Edge Function secrets:
--    Run: npx web-push generate-vapid-keys
--    Then in Supabase Dashboard > Edge Functions > send-notifications > Secrets:
--      VAPID_PUBLIC_KEY  = <your public key>
--      VAPID_PRIVATE_KEY = <your private key>
--      VAPID_SUBJECT     = mailto:your@email.com
--    Also add to .env.local:
--      NEXT_PUBLIC_VAPID_PUBLIC_KEY=<your public key>
--
-- 3. Store Supabase URL + service role key for pg_cron to call the Edge Function:
--    ALTER DATABASE postgres SET app.supabase_url TO 'https://YOUR_PROJECT_ID.supabase.co';
--    ALTER DATABASE postgres SET app.service_role_key TO 'YOUR_SERVICE_ROLE_KEY';
--
-- 4. Schedule the notification job (every 15 minutes):
--    SELECT cron.schedule(
--      'send-himo-notifications',
--      '*/15 * * * *',
--      $$
--        SELECT net.http_post(
--          url:=current_setting('app.supabase_url') || '/functions/v1/send-notifications',
--          headers:=jsonb_build_object(
--            'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
--            'Content-Type', 'application/json'
--          ),
--          body:='{}'::jsonb
--        );
--      $$
--    );
--
-- 5. Schedule notification log cleanup (daily at 3am UTC):
--    SELECT cron.schedule(
--      'cleanup-notification-log',
--      '0 3 * * *',
--      'DELETE FROM public.notification_log WHERE sent_at < now() - interval ''7 days'''
--    );
