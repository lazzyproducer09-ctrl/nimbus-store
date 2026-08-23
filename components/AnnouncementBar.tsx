"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TruckIcon, ReturnIcon, RupeeIcon, BoltIcon } from "./icons";

const MINIMAL_ROUTES = [
  "/login",
  "/signup",
  "/welcome",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Rotating trust messages that sit above the header. Each carries its own
// icon from the house set — the emoji these used to lead with (✦ ↩️ 💵 ⚡)
// rendered as a different picture on every device.
const MESSAGES: { Icon: (p: { className?: string }) => React.ReactElement; text: string }[] = [
  { Icon: TruckIcon, text: "Free shipping on orders over ₹999" },
  { Icon: ReturnIcon, text: "Easy 7-day returns — no awkward questions" },
  { Icon: RupeeIcon, text: "Cash on delivery across India" },
  { Icon: BoltIcon, text: "New drops every week — don't sleep on them" },
];

export function AnnouncementBar() {
  const pathname = usePathname();
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 3500);
    return () => clearInterval(t);
  }, []);

  if (MINIMAL_ROUTES.includes(pathname)) return null;

  const { Icon, text } = MESSAGES[i];

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
