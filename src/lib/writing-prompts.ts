const PROMPTS = [
  "What brought you joy today?",
  "What's one thing you're proud of?",
  "How does your body feel right now?",
  "What can you let go of tonight?",
  "What are you grateful for today?",
  "Describe a moment that made you smile.",
  "What did you learn about yourself recently?",
  "What would make tomorrow great?",
  "How did you take care of yourself today?",
  "What's something kind you did for someone?",
  "What's been on your mind lately?",
  "Describe a small win you had today.",
  "What gives you energy?",
  "What's one thing you'd like to improve?",
  "How are you feeling right now, honestly?",
  "What's a boundary you're glad you set?",
  "What does rest look like for you?",
  "Write about a person who inspires you.",
  "What's something you forgive yourself for?",
  "What are you looking forward to?",
];

/**
 * Return a shuffled subset of writing prompts.
 */
export function getRandomPrompts(count: number = 4): string[] {
  const shuffled = [...PROMPTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Earning rate: 0.5 cents per word */
export const CENTS_PER_WORD = 0.5;

/** Flat rate for mood check-in: 2 cents */
export const MOOD_CHECKIN_REWARD = 2;

/**
 * Calculate cents earned for a reflection based on word count.
 * Returns an integer (rounds down).
 */
export function calculateReflectionEarnings(wordCount: number): number {
  return Math.floor(wordCount * CENTS_PER_WORD);
}
