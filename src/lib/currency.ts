/**
 * Format an integer amount of cents as a dollar string.
 * e.g., 250 -> "$2.50", 5 -> "$0.05", 0 -> "$0.00"
 */
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/** Currency reward in cents for each difficulty level */
export const DIFFICULTY_REWARDS = {
  easy: 2,
  medium: 5,
  hard: 10,
} as const;

export type Difficulty = keyof typeof DIFFICULTY_REWARDS;
