import { formatCurrency } from "@/lib/currency";
import { Card, FluentEmoji, ProgressBar } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

export function ProgressCard({
  totalWords,
  totalEarned,
}: {
  totalWords: number;
  totalEarned: number;
}) {
  return (
    <Card variant="standard">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-tiny text-neutral-700/70">Keep writing to earn</p>
          <p className="mt-1 text-small text-neutral-900">
            You&apos;ve written <span className="font-semibold">{totalWords}</span> words today
          </p>
        </div>
        <div className="text-right">
          <p className="text-tiny text-neutral-700/70">Earned</p>
          <p className="mt-1 inline-flex items-center gap-1 text-small font-semibold text-neutral-900">
            <FluentEmoji emoji={EMOJI.sparkles} size={14} />
            {formatCurrency(totalEarned)}
          </p>
        </div>
      </div>
      <ProgressBar value={Math.min(totalWords, 500)} max={500} className="mt-3 h-2" />
    </Card>
  );
}
