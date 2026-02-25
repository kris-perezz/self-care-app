"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";

function getBack(pathname: string, searchParams: URLSearchParams): string | null {
  if (pathname === "/goals/new") return "/goals";
  if (/^\/goals\/[^/]+\/edit$/.test(pathname)) return "/goals";
  if (/^\/goals\/[^/]+\/view$/.test(pathname) || /^\/goals\/[^/]+$/.test(pathname)) {
    const from = searchParams.get("from");
    return from === "me" ? "/me/goals" : from === "goals" ? "/goals" : "/home";
  }
  if (pathname === "/reflect/write") return "/reflect";
  if (pathname === "/reflect/prompts") return "/reflect";
  if (pathname === "/me/goals") return "/me";
  if (pathname === "/me/reflections") return "/me";
  if (pathname === "/me/settings") return "/me";
  return null;
}

export function BackButton() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const back = getBack(pathname, searchParams);

  if (!back) return null;

  return (
    <Link
      href={back}
      aria-label="Back"
      className="interactive-icon -ml-1 mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100"
    >
      <ArrowLeft size={20} weight="regular" />
    </Link>
  );
}
