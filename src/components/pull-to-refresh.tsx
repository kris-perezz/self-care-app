"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown } from "@phosphor-icons/react/dist/ssr";

const THRESHOLD = 72; // px of pull needed to trigger refresh
const MAX_PULL = 100; // max visual travel

export function PullToRefresh() {
  const router = useRouter();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(".app-shell");
    if (!el) return;

    function onStart(e: TouchEvent) {
      if (el!.scrollTop === 0 && !refreshingRef.current) {
        startYRef.current = e.touches[0].clientY;
      }
    }

    function onMove(e: TouchEvent) {
      if (startYRef.current === null) return;
      if (el!.scrollTop > 0) {
        startYRef.current = null;
        pullRef.current = 0;
        setPull(0);
        return;
      }
      const raw = e.touches[0].clientY - startYRef.current;
      if (raw <= 0) return;
      // Rubber-band resistance: pull slows as it approaches MAX_PULL
      const distance = Math.min(raw * 0.45, MAX_PULL);
      pullRef.current = distance;
      setPull(distance);
      e.preventDefault();
    }

    function onEnd() {
      if (startYRef.current === null) return;
      startYRef.current = null;
      if (pullRef.current >= THRESHOLD && !refreshingRef.current) {
        refreshingRef.current = true;
        setRefreshing(true);
        setPull(0);
        pullRef.current = 0;
        router.refresh();
        setTimeout(() => {
          refreshingRef.current = false;
          setRefreshing(false);
        }, 1200);
      } else {
        pullRef.current = 0;
        setPull(0);
      }
    }

    function onCancel() {
      startYRef.current = null;
      pullRef.current = 0;
      setPull(0);
    }

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    el.addEventListener("touchcancel", onCancel, { passive: true });

    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onCancel);
    };
  }, [router]);

  const ready = pull >= THRESHOLD || refreshing;
  // Slide in from above: hidden at pull=0, fully visible around pull=44px
  const indicatorTop = refreshing ? 4 : pull - 44;
  const opacity = refreshing ? 1 : Math.min(pull / 44, 1);

  if (pull === 0 && !refreshing) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed left-0 right-0 z-40 flex justify-center"
      style={{
        top: `calc(env(safe-area-inset-top, 0px) + ${indicatorTop}px)`,
        transition: pull === 0 ? "top 0.3s ease" : undefined,
      }}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full shadow-modal transition-colors duration-150 ${
          ready ? "bg-primary-500 text-white" : "bg-white text-primary-500"
        }`}
        style={{ opacity }}
      >
        {refreshing ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <ArrowDown
            size={16}
            weight="bold"
            style={{
              transform: `rotate(${ready ? 180 : 0}deg)`,
              transition: "transform 0.2s ease",
            }}
          />
        )}
      </div>
    </div>
  );
}
