export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  difficulty: "easy" | "medium" | "hard";
  /** Auto-set from difficulty: easy=2, medium=5, hard=10 (cents) */
  currency_reward: number;
  /** Emoji icon displayed on goal card (defaults to 🎯) */
  emoji: string;
  /** Optional time of day, e.g. "08:00" */
  scheduled_time: string | null;
  /** Optional date for filtering, e.g. "2026-02-02" */
  scheduled_date: string | null;
  /** null = incomplete, ISO timestamp string = completed */
  completed_at: string | null;
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
  /** Cents earned for this entry */
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
  /** IANA timezone identifier (e.g., 'America/Edmonton') */
  timezone: string;
  current_streak: number;
  longest_streak: number;
  /** Last date a goal was completed (user's timezone), e.g. "2026-02-02" */
  last_active_date: string | null;
  created_at: string;
}

export interface Reward {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  /** Price in cents (e.g., 700 = $7.00) */
  price: number;
  is_active: boolean;
  /** null = still saving, ISO timestamp = purchased */
  purchased_at: string | null;
  created_at: string;
}
