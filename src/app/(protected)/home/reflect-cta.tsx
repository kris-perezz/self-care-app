import Link from "next/link";
import { Button, FluentEmoji } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

export function ReflectCta() {
  return (
    <Button asChild variant="primary" className="w-full">
      <Link href="/reflect">
        <FluentEmoji emoji={EMOJI.writing} size={18} />
        Reflect Now
      </Link>
    </Button>
  );
}
