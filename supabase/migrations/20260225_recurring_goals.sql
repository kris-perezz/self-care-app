-- Add recurring goal support
ALTER TABLE public.goals
  ADD COLUMN recurring_days integer[],    -- [0=Sun,1=Mon,...,6=Sat], NULL = one-time
  ADD COLUMN last_completed_date date;    -- tracks "completed today" for recurring goals

-- Seed function for new users
DROP TRIGGER IF EXISTS on_profile_created_seed_default_goals ON public.profiles;
DROP FUNCTION IF EXISTS public.seed_default_goals();

CREATE OR REPLACE FUNCTION public.seed_default_goals()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.goals (user_id, title, emoji, difficulty, currency_reward, recurring_days)
  VALUES
    (NEW.id, 'Drink 8 glasses of water',       '💧', 'easy',   2,  ARRAY[0,1,2,3,4,5,6]),
    (NEW.id, 'Move your body for 20 minutes',   '🏃', 'medium', 5,  ARRAY[0,1,2,3,4,5,6]),
    (NEW.id, 'Get 7–8 hours of sleep',          '😴', 'easy',   2,  ARRAY[0,1,2,3,4,5,6]),
    (NEW.id, 'Read for 15 minutes',             '📖', 'easy',   2,  ARRAY[0,1,2,3,4,5,6]),
    (NEW.id, 'Take 5 minutes to breathe',       '🧘', 'easy',   2,  ARRAY[0,1,2,3,4,5,6]);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_created_seed_default_goals
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.seed_default_goals();

-- Backfill default goals for existing users
INSERT INTO public.goals (user_id, title, emoji, difficulty, currency_reward, recurring_days)
SELECT p.id, u.title, u.emoji, u.difficulty::text, u.currency_reward, ARRAY[0,1,2,3,4,5,6]
FROM public.profiles p
CROSS JOIN (VALUES
  ('Drink 8 glasses of water',      '💧', 'easy',   2),
  ('Move your body for 20 minutes', '🏃', 'medium', 5),
  ('Get 7–8 hours of sleep',        '😴', 'easy',   2),
  ('Read for 15 minutes',           '📖', 'easy',   2),
  ('Take 5 minutes to breathe',     '🧘', 'easy',   2)
) AS u(title, emoji, difficulty, currency_reward);
