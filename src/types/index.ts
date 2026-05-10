export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  difficulty: "easy" | "medium" | "hard";
  currency_reward: number;
  emoji: string;
  scheduled_time: string | null;
  scheduled_date: string | null;
  completed_at: string | null;
  recurring_days: number[] | null;
  last_completed_date: string | null;
  recurrence_interval: number | null;
  recurrence_unit: "hours" | "days" | "months" | null;
  last_completed_at: string | null;
  pre_due_reminders_enabled: boolean;
  created_at: string;
}

export interface NotificationSettings {
  user_id: string;
  enabled: boolean;
  daily_summary_enabled: boolean;
  daily_summary_time: string;
  at_time_reminders_enabled: boolean;
  overdue_reminders_enabled: boolean;
  streak_at_risk_enabled: boolean;
  streak_at_risk_time: string;
  reflection_reminder_enabled: boolean;
  reflection_reminder_time: string;
  mood_reminder_enabled: boolean;
  mood_reminder_time: string;
  updated_at: string;
}

export function isIntervalGoal(
  goal: Goal
): goal is Goal & {
  recurrence_interval: number;
  recurrence_unit: "hours" | "days" | "months";
} {
  return goal.recurrence_interval !== null && goal.recurrence_unit !== null;
}

export function isRecurringGoal(goal: Goal): goal is Goal & { recurring_days: number[] } {
  return goal.recurring_days !== null && goal.recurring_days.length > 0;
}

export function isOneTimeGoal(goal: Goal): boolean {
  return !isIntervalGoal(goal) && !isRecurringGoal(goal);
}

export interface Reflection {
  id: string;
  user_id: string;
  type: "mood" | "prompted" | "freewrite";
  mood: string | null;
  prompt: string | null;
  content: string;
  word_count: number;
  currency_earned: number;
  created_at: string;
}

export interface CurrencyTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: "goal" | "reflection" | "reward_spend";
  reference_id: string | null;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  timezone: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  created_at: string;
}

export interface WeightLog {
  id: string;
  user_id: string;
  weight_lbs: number;
  logged_date: string;
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  price: number;
  is_active: boolean;
  purchased_at: string | null;
  created_at: string;
}
