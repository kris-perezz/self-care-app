export const EMOJI = {
  target: "\u{1F3AF}",
  gift: "\u{1F381}",
  coffee: "\u2615",
  books: "\u{1F4DA}",
  spa: "\u{1F9D6}",
  movie: "\u{1F3AC}",
  writing: "\u{1F4DD}",
  happy: "\u{1F60A}",
  calm: "\u{1F60C}",
  sad: "\u{1F614}",
  anxious: "\u{1F630}",
  tired: "\u{1F634}",
  frustrated: "\u{1F624}",
  sparkles: "\u2728",
  cat: "\u{1F431}",
  gear: "\u2699",
  chart: "\u{1F4C8}",
  neutral: "\u{1F636}",
} as const;

export const GOAL_EMOJI_OPTIONS = [
  EMOJI.target,
  EMOJI.sparkles,
  EMOJI.books,
  EMOJI.coffee,
  EMOJI.writing,
  EMOJI.happy,
  EMOJI.calm,
  EMOJI.cat,
] as const;

export const REWARD_EMOJI_OPTIONS = [
  EMOJI.gift,
  EMOJI.coffee,
  EMOJI.books,
  EMOJI.spa,
  EMOJI.movie,
  EMOJI.sparkles,
  EMOJI.cat,
] as const;
