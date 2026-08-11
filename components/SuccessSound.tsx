"use client";

import { useEffect, useRef } from "react";
import { playSuccessChime } from "@/lib/chime";

// Plays the success chime once when this mounts (order confirmation page).
// Only fires when the admin has sounds enabled.
export function SuccessSound({
  enabled,
  volume,
}: {
  enabled: boolean;
  volume: number;
}) {
  const played = useRef(false);

  useEffect(() => {
    if (!enabled || played.current) return;
    played.current = true;
    playSuccessChime(volume);
  }, [enabled, volume]);

  return null;
}
