import Link from "next/link";
import { Button, Card, FluentEmoji } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

export function ReflectCta({ perfectDay }: { perfectDay?: boolean }) {
  if (perfectDay) {
    return (
      <Card variant="tintAccent">
        <p className="flex items-center gap-1.5 text-small font-medium text-neutral-900">
          All done today! Write about your perfect day?
          <FluentEmoji emoji={EMOJI.writing} size={18} />
        </p>
        <p className="mt-0.5 font-heading-italic text-tiny text-neutral-500">Even 10 words counts.</p>
        <Button asChild variant="primary" className="mt-3 w-full">
          <Link href="/reflect">Write a Reflection</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card variant="tintAccent">
      <p className="text-small font-medium text-neutral-900">How are you feeling today?</p>
      <p className="mt-0.5 font-heading-italic text-tiny text-neutral-500">Even 10 words counts.</p>
      <Button asChild variant="primary" className="mt-3 w-full">
        <Link href="/reflect">
          <FluentEmoji emoji={EMOJI.writing} size={18} />
          Reflect Now
        </Link>
      </Button>
    </Card>
  );
}
