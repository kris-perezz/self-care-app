"use client";

import { useEffect } from "react";
import { Card } from "@/components/ui";

export function PerfectDayBanner({ perfectDay }: { perfectDay: boolean }) {
  useEffect(() => {
    if (!perfectDay) return;
    import("canvas-confetti").then((m) => {
      m.default({
        particleCount: 120,
        spread: 160,
        origin: { y: 0.3 },
        colors: ["#74A12E", "#F4A6B6", "#d4996f", "#fff"],
      });
    });
  }, [perfectDay]);

  if (!perfectDay) return null;

  return (
    <Card variant="tintPrimary">
      <p className="font-heading text-base font-semibold italic text-primary-700">
        ✨ Perfect Day! All goals complete.
      </p>
    </Card>
  );
}
