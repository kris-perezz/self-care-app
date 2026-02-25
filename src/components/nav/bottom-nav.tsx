"use client";

import {
  BookOpenText,
  CheckCircle,
  Gift,
  House,
  UserCircle,
} from "@phosphor-icons/react/dist/ssr";
import { NavTabItem } from "@/components/ui";

const tabs = [
  { name: "Home", href: "/home", icon: House },
  { name: "Goals", href: "/goals", icon: CheckCircle },
  { name: "Reflect", href: "/reflect", icon: BookOpenText },
  { name: "Rewards", href: "/rewards", icon: Gift },
  { name: "Me", href: "/me", icon: UserCircle },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-100 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[900px] items-center justify-around px-4">
        {tabs.map((tab) => (
          <NavTabItem
            key={tab.name}
            href={tab.href}
            label={tab.name}
            icon={tab.icon}
          />
        ))}
      </div>
    </nav>
  );
}
