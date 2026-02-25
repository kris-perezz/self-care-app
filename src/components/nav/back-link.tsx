import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

export function BackLink({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="Back"
      className="interactive-icon -ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100"
    >
      <ArrowLeft size={20} weight="regular" />
    </Link>
  );
}
