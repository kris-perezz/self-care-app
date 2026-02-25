export const PROMPTS_BY_CATEGORY: Record<string, string[]> = {
  Gratitude: [
    "What brought you joy today?",
    "What are you grateful for today?",
    "Describe a moment that made you smile.",
    "What's something kind someone did for you recently?",
    "What's a small everyday thing you often take for granted?",
    "Who in your life are you most thankful for right now?",
    "What's a challenge you've faced that you're actually grateful for?",
    "Who is one person you would like to appreciate more?",
    "What did kindness mean to you last year compared to today?",
    "Describe a moment when someone surprised you with their kindness.",
  ],
  Mood: [
    "How are you feeling right now, honestly?",
    "How does your body feel right now?",
    "What's been on your mind lately?",
    "Describe your emotional weather today — sunny, stormy, foggy?",
    "What feeling keeps showing up for you this week?",
    "What's one word that captures your mood, and why?",
    "What's on your mind?",
  ],
  "Self-Love": [
    "What's something you forgive yourself for?",
    "What would you say to a friend who was feeling the way you do right now?",
    "What's something you've been too hard on yourself about?",
    "In what area of your life do you need more grace?",
    "What does being kind to yourself look like today?",
    "What's a mistake that taught you something valuable?",
  ],
  Growth: [
    "What did you learn about yourself recently?",
    "What's one thing you'd like to improve?",
    "What's a belief you've changed your mind about?",
    "What habit or pattern are you trying to break?",
    "What's something you used to be afraid of that you've grown past?",
    "What does the best version of yourself look like?",
    "What's one small step you could take toward a goal this week?",
    "What do you wish you spent less time on?",
    "How would you change the way you lived if you didn't care about other people's opinions?",
  ],
  Rest: [
    "What does rest look like for you?",
    "How did you take care of yourself today?",
    "What activity makes you feel most recharged?",
    "What does your body need more of right now?",
    "When do you feel most at peace?",
    "What helps you wind down at the end of the day?",
    "Was there anything different about your sleep last night?",
    "What do you think your last dream might mean?",
  ],
  Wins: [
    "What's one thing you're proud of?",
    "Describe a small win you had today.",
    "What's something you did this week that you wouldn't have done a year ago?",
    "What's a skill or strength you're proud of developing?",
    "What's the most courageous thing you've done recently?",
    "What did you do today that took effort, even if it seems small?",
    "What moment from today can you be proud of?",
  ],
  Relationships: [
    "What's something kind you did for someone?",
    "Write about a person who inspires you.",
    "What's a relationship in your life you want to nurture?",
    "What's something you wish you could say to someone?",
    "How have the people around you shaped who you are?",
    "What does a healthy relationship look like to you?",
    "What quality do you appreciate the most in a friend?",
    "What is a recent interaction with a friend that made you smile?",
    "Describe a moment you showed kindness to someone else.",
  ],
  Values: [
    "What's a boundary you're glad you set?",
    "What's something you said no to recently, and how did it feel?",
    "What values feel most important to you right now?",
    "Where in your life do you need to protect your energy more?",
    "What's something you keep tolerating that you'd like to change?",
    "What do you prioritize most in life? Why?",
  ],
  Energy: [
    "What gives you energy?",
    "What drains your energy most right now?",
    "What activity makes you feel most alive?",
    "When do you feel most like yourself?",
    "What does a high-energy day look like for you?",
    "What was the most encouraging moment of your day?",
  ],
  Creativity: [
    "What's something you've been curious about lately?",
    "If you could learn anything new, what would it be?",
    "Describe a place, real or imagined, where you feel most creative.",
    "What's an idea you haven't told anyone yet?",
    "What would you make or create if you had no limits?",
  ],
  "Hard Days": [
    "What can you let go of tonight?",
    "What's something you've been avoiding thinking about?",
    "What emotion has been hardest to sit with lately?",
    "What's a fear you'd like to face?",
    "What's weighing on you right now that you haven't expressed?",
    "What does healing look like for you in this season?",
    "What's one thing in your control to offset your unhappiness?",
    "Has a similar situation happened before?",
  ],
  Vent: [
    "What's bothering you today?",
    "What's frustrating you most right now?",
    "What do you wish someone understood about how you're feeling?",
    "What's a situation you need to get off your chest?",
  ],
  Past: [
    "How do you feel about the past week?",
    "What was most surprising about the past month?",
    "What was most surprising about the past year?",
    "How did today compare to last week?",
    "What's something from this week you want to remember?",
  ],
  Future: [
    "What are you looking forward to?",
    "What would make tomorrow great?",
    "What does your dream day look like?",
    "Where do you hope to be in one year?",
    "What's a goal that still excites you, even if it feels far away?",
    "What's one thing you want to create or build in your life?",
    "What is one thing you can do to be more kind to your body next week?",
    "How are you hoping next month to go?",
    "What do you hope next year will be like?",
    "Write an affirmation to set a positive tone!",
  ],
  "My Story": [
    "What is your earliest memory?",
    "Describe a moment you were emotionally open as a child.",
    "What is one activity that meant a lot to you as a teen?",
    "What was your first date like?",
    "What was the name of your first serious crush?",
    "Is there any famous person or character you can impersonate really well?",
    "What is one thing your parents did that you wouldn't want to repeat?",
    "How have your paternal grandparents influenced your family?",
  ],
  "Just for Fun": [
    "True or false? Nobody really likes the way beer tastes.",
    "If you could go anywhere in the world for 1 month, where would you go?",
    "Can you tell a lot about a person by their appearance?",
    "What store do you feel loyal to. Why?",
    "Do you check the expiration date on food before buying it?",
    "What food makes you feel most guilty? Why?",
    "What does it mean to raise a well-rounded child?",
    "What's a funny moment that warms you up?",
    "How would you define intelligence?",
    "Would you say that the time you spend on social media is time well spent?",
  ],
};

export const PROMPT_CATEGORIES = Object.keys(PROMPTS_BY_CATEGORY);

/**
 * Return a shuffled subset of writing prompts drawn from all categories.
 */
export function getRandomPrompts(count: number = 4): string[] {
  const all = Object.values(PROMPTS_BY_CATEGORY).flat();
  return [...all].sort(() => Math.random() - 0.5).slice(0, count);
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
