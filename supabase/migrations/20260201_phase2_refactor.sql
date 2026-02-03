-- ============================================
-- Self Care App: Full Schema (Phase 2)
-- Run this in the Supabase SQL Editor
-- ============================================
-- Creates all tables from scratch with:
--   - profiles (with timezone)
--   - goals (no is_completed — uses completed_at only)
--   - currency_transactions
--   - Trigger for auto-creating profiles on signup
--   - RLS policies on all tables
--   - Performance indexes

BEGIN;

-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  display_name text,
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 2. PROFILE AUTO-CREATION TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, timezone)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'timezone', 'UTC')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing trigger first (it exists but pointed to old function)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill profile for existing user(s)
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. GOALS TABLE
-- ============================================
-- completed_at is null = incomplete, has timestamp = completed.
-- No is_completed boolean — completed_at is the single source of truth.
CREATE TABLE public.goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  currency_reward integer NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_goals_user_id ON public.goals (user_id);
CREATE INDEX idx_goals_user_id_created_at ON public.goals (user_id, created_at);

-- ============================================
-- 4. CURRENCY TRANSACTIONS TABLE
-- ============================================
-- Single source of truth for currency balance.
-- Balance = SUM(amount) for a given user.
-- Positive = earned, negative = spent.
CREATE TABLE public.currency_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  source text NOT NULL CHECK (source IN ('goal', 'reflection', 'reward_spend')),
  reference_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.currency_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.currency_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.currency_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_currency_transactions_user_id_amount ON public.currency_transactions (user_id, amount);
CREATE INDEX idx_currency_transactions_user_id_created_at ON public.currency_transactions (user_id, created_at);

COMMIT;

-- ============================================
-- VERIFICATION QUERIES (run these after the migration)
-- ============================================
-- 1. Check all tables exist:
--    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'goals', 'currency_transactions');
--
-- 2. Check profiles columns:
--    SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position;
--
-- 3. Verify goals has NO is_completed:
--    SELECT column_name FROM information_schema.columns WHERE table_name = 'goals' ORDER BY ordinal_position;
--
-- 4. Verify user-profile count match:
--    SELECT (SELECT COUNT(*) FROM auth.users) AS auth_count, (SELECT COUNT(*) FROM public.profiles) AS profile_count;
--
-- 5. Verify trigger exists:
--    SELECT trigger_name FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
--
-- 6. Check indexes:
--    SELECT indexname FROM pg_indexes WHERE tablename IN ('goals', 'currency_transactions') AND indexname LIKE 'idx_%';
--
-- 7. Verify RLS enabled:
--    SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('profiles', 'goals', 'currency_transactions');
