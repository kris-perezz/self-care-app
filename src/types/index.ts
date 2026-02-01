export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  currency_reward: number;
  created_at: string;
  completed_at: string | null;
}

export interface Reflection {
  id: string;
  user_id: string;
  content: string;
  mood: string | null;
  currency_reward: number;
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
  created_at: string;
}
