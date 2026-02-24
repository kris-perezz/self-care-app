import { EMOJI } from "./emoji";

export const MOODS = [
  { emoji: EMOJI.happy, label: "Happy" },
  { emoji: EMOJI.calm, label: "Calm" },
  { emoji: EMOJI.sad, label: "Sad" },
  { emoji: EMOJI.anxious, label: "Anxious" },
  { emoji: EMOJI.tired, label: "Tired" },
  { emoji: EMOJI.frustrated, label: "Frustrated" },
] as const;

export type MoodLabel = (typeof MOODS)[number]["label"];

export function getMoodEmoji(mood: string | null): string {
  if (!mood) return EMOJI.neutral;
  const found = MOODS.find((m) => m.label.toLowerCase() === mood.toLowerCase());
  return found?.emoji ?? EMOJI.neutral;
}
