-- ============================================
-- Self Care App: Phase 3 Migration
-- Run this in the Supabase SQL Editor
-- ============================================
-- Adds:
--   - Goal enhancements (difficulty, scheduling)
--   - Reflections table
--   - Rewards table
--   - Streak tracking on profiles
-- ============================================

BEGIN;

-- ============================================
-- 1. ALTER GOALS TABLE
-- ============================================
-- Add difficulty (determines currency reward), scheduled_time, scheduled_date
ALTER TABLE public.goals
  ADD COLUMN difficulty text NOT NULL DEFAULT 'medium'
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  ADD COLUMN scheduled_time time,
  ADD COLUMN scheduled_date date;

-- Index for date-based filtering (Today / This week / All)
CREATE INDEX idx_goals_user_id_scheduled_date ON public.goals (user_id, scheduled_date);

-- ============================================
-- 2. REFLECTIONS TABLE
-- ============================================
CREATE TABLE public.reflections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('mood', 'prompted', 'freewrite')),
  mood text,
  prompt text,
  content text NOT NULL DEFAULT '',
  word_count integer NOT NULL DEFAULT 0,
  currency_earned integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reflections"
  ON public.reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reflections"
  ON public.reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reflections"
  ON public.reflections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reflections"
  ON public.reflections FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_reflections_user_id_created_at ON public.reflections (user_id, created_at);

-- ============================================
-- 3. REWARDS TABLE
-- ============================================
CREATE TABLE public.rewards (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  emoji text NOT NULL DEFAULT '🎁',
  price integer NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  purchased_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own rewards"
  ON public.rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own rewards"
  ON public.rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rewards"
  ON public.rewards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rewards"
  ON public.rewards FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_rewards_user_id_is_active ON public.rewards (user_id, is_active);

-- ============================================
-- 4. ALTER PROFILES FOR STREAK TRACKING
-- ============================================
ALTER TABLE public.profiles
  ADD COLUMN current_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN longest_streak integer NOT NULL DEFAULT 0,
  ADD COLUMN last_active_date date;

COMMIT;

-- ============================================
-- VERIFICATION QUERIES (run after migration)
-- ============================================
-- 1. Check new goals columns:
--    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'goals' AND column_name IN ('difficulty', 'scheduled_time', 'scheduled_date');
--
-- 2. Check reflections table:
--    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'reflections' ORDER BY ordinal_position;
--
-- 3. Check rewards table:
--    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'rewards' ORDER BY ordinal_position;
--
-- 4. Check profiles streak columns:
--    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' AND column_name IN ('current_streak', 'longest_streak', 'last_active_date');
--
-- 5. Check new indexes:
--    SELECT indexname FROM pg_indexes WHERE indexname LIKE 'idx_%' AND tablename IN ('goals', 'reflections', 'rewards');
--
-- 6. Verify RLS enabled:
--    SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('reflections', 'rewards');
