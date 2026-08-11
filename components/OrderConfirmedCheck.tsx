"use client";

import { useEffect, useRef } from "react";
import { playSuccessChime, type ChimeType } from "@/lib/chime";

// Animated green tick shown on a confirmed order. The success chime plays in
// sync with the tick drawing itself (only if the admin enabled sounds).
export function OrderConfirmedCheck({
  soundEnabled,
  volume,
  soundType,
}: {
  soundEnabled: boolean;
  volume: number;
  soundType: ChimeType;
}) {
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (!soundEnabled) return;
    // fire the sound as the checkmark starts drawing
    const t = setTimeout(() => playSuccessChime(volume, soundType), 250);
    return () => clearTimeout(t);
  }, [soundEnabled, volume, soundType]);

  return (
    <div className="check-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
      <svg viewBox="0 0 52 52" className="h-9 w-9" aria-hidden>
        <path
          className="check-draw"
          fill="none"
          stroke="#16a34a"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 27 l8 8 l16 -18"
        />
      </svg>
    </div>
  );
}
