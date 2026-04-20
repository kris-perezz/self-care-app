"use client";

import { useEffect } from "react";
import { Card, FluentEmoji } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

export function PerfectDayBanner({ perfectDay }: { perfectDay: boolean }) {
  useEffect(() => {
    if (!perfectDay) return;
    const today = new Date().toDateString();
    if (localStorage.getItem("himo-confetti-date") === today) return;
    import("canvas-confetti").then((m) => {
      m.default({
        particleCount: 120,
        spread: 160,
        origin: { y: 0.3 },
        colors: ["#74A12E", "#F4A6B6", "#d4996f", "#fff"],
      });
      localStorage.setItem("himo-confetti-date", today);
    });
  }, [perfectDay]);

  if (!perfectDay) return null;

  return (
    <Card variant="tintPrimary">
      <p className="flex items-center gap-1.5 font-heading-italic text-body font-semibold text-primary-700">
        <FluentEmoji emoji={EMOJI.sparkles} size={18} />
        Perfect Day! All goals complete.
      </p>
    </Card>
  );
}
