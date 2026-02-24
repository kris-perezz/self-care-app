import Image from "next/image";
import { cn } from "@/lib/utils";
import { EMOJI } from "@/lib/emoji";

const EMOJI_ASSET_MAP: Record<string, string> = {
  [EMOJI.target]: "target.svg",
  [EMOJI.gift]: "gift.svg",
  [EMOJI.coffee]: "coffee.svg",
  [EMOJI.books]: "books.svg",
  [EMOJI.spa]: "spa.svg",
  [EMOJI.movie]: "movie.svg",
  [EMOJI.writing]: "writing.svg",
  [EMOJI.happy]: "happy.svg",
  [EMOJI.calm]: "calm.svg",
  [EMOJI.sad]: "sad.svg",
  [EMOJI.anxious]: "anxious.svg",
  [EMOJI.tired]: "tired.svg",
  [EMOJI.frustrated]: "frustrated.svg",
  [EMOJI.sparkles]: "sparkles.svg",
  [EMOJI.cat]: "cat.svg",
  [EMOJI.gear]: "gear.svg",
  [EMOJI.chart]: "chart.svg",
};

export interface FluentEmojiProps {
  emoji: string;
  label?: string;
  size?: number;
  className?: string;
  fallback?: string;
}

export function FluentEmoji({
  emoji,
  label,
  size = 24,
  className,
  fallback,
}: FluentEmojiProps) {
  const fileName = EMOJI_ASSET_MAP[emoji];

  if (!fileName) {
    return (
      <span
        role="img"
        aria-label={label ?? fallback ?? emoji}
        className={className}
        style={{ fontSize: size, lineHeight: 1 }}
      >
        {fallback ?? emoji}
      </span>
    );
  }

  return (
    <Image
      src={`/fluent-emoji/${fileName}`}
      alt={label ?? emoji}
      width={size}
      height={size}
      className={cn("inline-block", className)}
      unoptimized
    />
  );
}
