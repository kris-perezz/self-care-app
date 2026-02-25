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
  created_at: string;
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
