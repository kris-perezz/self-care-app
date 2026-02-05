export const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
  { emoji: "😴", label: "Tired" },
  { emoji: "😤", label: "Frustrated" },
] as const;

export type MoodLabel = (typeof MOODS)[number]["label"];

/** Get the emoji for a mood label (case-insensitive) */
export function getMoodEmoji(mood: string | null): string {
  if (!mood) return "😶";
  const found = MOODS.find(
    (m) => m.label.toLowerCase() === mood.toLowerCase()
  );
  return found?.emoji ?? "😶";
}
