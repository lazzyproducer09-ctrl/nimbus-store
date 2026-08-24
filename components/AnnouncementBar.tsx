"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { iconByName } from "./icons";
import type { Announcement } from "@/lib/site-content";

const MINIMAL_ROUTES = [
  "/login",
  "/signup",
  "/welcome",
];

// Rotating trust messages that sit above the header. The list is edited in
// Admin → Storefront content; each message carries its own icon from the house
// set, because the emoji these used to lead with (✦ ↩️ 💵 ⚡) rendered as a
// different picture on every device.
export function AnnouncementBar({ messages }: { messages: Announcement[] }) {
  const pathname = usePathname();
  const [i, setI] = useState(0);
  const count = messages.length;

  useEffect(() => {
    if (count < 2) return; // nothing to rotate through
    const t = setInterval(() => setI((n) => (n + 1) % count), 3500);
    return () => clearInterval(t);
  }, [count]);

  if (MINIMAL_ROUTES.includes(pathname)) return null;
  if (count === 0) return null;

  // `i` can outrun the list if messages were removed in admin while open.
  const msg = messages[i % count];
  const Icon = iconByName(msg.icon);
  const text = msg.text;

  return (
    // bg-void, not bg-black — pure black left a visible seam against the page
    <div className="border-b border-edge-soft bg-void">
      <div className="mx-auto flex h-9 w-full max-w-6xl items-center justify-center overflow-hidden px-5">
        <p
          key={i}
          className="announce-msg flex items-center gap-2 text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ash"
        >
          <Icon className="h-3.5 w-3.5 flex-shrink-0 text-volt" />
          {text}
        </p>
      </div>
    </div>
  );
}
