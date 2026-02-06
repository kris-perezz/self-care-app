"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";

type NavIconProps = {
  size?: string | number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  className?: string;
};

export interface NavTabItemProps {
  href: string;
  label: string;
  icon: ComponentType<NavIconProps>;
}

export function NavTabItem({ href, label, icon: IconComponent }: NavTabItemProps) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 rounded-xl px-4 py-2 text-tiny font-medium transition-all duration-150 ease-in-out",
        isActive ? "bg-primary-50 text-primary-700" : "text-neutral-700 hover:text-neutral-900"
      )}
    >
      <span className="interactive-icon flex items-center justify-center">
        <IconComponent size={22} weight={isActive ? "fill" : "regular"} />
      </span>
      {label}
    </Link>
  );
}
