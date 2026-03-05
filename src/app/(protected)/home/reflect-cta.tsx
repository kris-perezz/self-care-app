import Link from "next/link";
import { Button, Card, FluentEmoji } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

export function ReflectCta({ perfectDay }: { perfectDay?: boolean }) {
  if (perfectDay) {
    return (
      <Card variant="tintAccent">
        <p className="text-small font-medium text-neutral-900">
          All done today! Write about your perfect day? ✍️
        </p>
        <p className="mt-0.5 text-tiny text-neutral-500">Even 10 words counts.</p>
        <Button asChild variant="primary" className="mt-3 w-full">
          <Link href="/reflect">Write a Reflection</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Button asChild variant="primary" className="w-full">
      <Link href="/reflect">
        <FluentEmoji emoji={EMOJI.writing} size={18} />
        Reflect Now
      </Link>
    </Button>
  );
}
