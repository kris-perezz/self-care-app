-- Add interval-based recurrence support to goals
ALTER TABLE public.goals
  ADD COLUMN recurrence_interval integer,
  ADD COLUMN recurrence_unit text,
  ADD COLUMN last_completed_at timestamptz;

-- Both interval columns must be set together or both null
ALTER TABLE public.goals
  ADD CONSTRAINT recurrence_both_or_neither CHECK (
    (recurrence_interval IS NULL AND recurrence_unit IS NULL) OR
    (recurrence_interval IS NOT NULL AND recurrence_unit IS NOT NULL)
  );

-- Valid unit values only
ALTER TABLE public.goals
  ADD CONSTRAINT recurrence_unit_valid CHECK (
    recurrence_unit IS NULL OR recurrence_unit IN ('hours', 'days', 'months')
  );

-- Interval must be positive
ALTER TABLE public.goals
  ADD CONSTRAINT recurrence_interval_positive CHECK (
    recurrence_interval IS NULL OR recurrence_interval >= 1
  );

-- last_completed_at only valid on interval goals
ALTER TABLE public.goals
  ADD CONSTRAINT last_completed_at_only_interval CHECK (
    recurrence_interval IS NOT NULL OR last_completed_at IS NULL
  );
