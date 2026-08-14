"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const MINIMAL_ROUTES = [
  "/login",
  "/signup",
  "/welcome",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

// Rotating trust messages that sit above the header.
const MESSAGES = [
  "✦  Free shipping on orders over ₹999",
  "↩️  Easy 7-day returns — no awkward questions",
  "💵  Cash on delivery across India",
  "⚡  New drops every week — don't sleep on them",
];

export function AnnouncementBar() {
  const pathname = usePathname();
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % MESSAGES.length), 3500);
    return () => clearInterval(t);
  }, []);

  if (MINIMAL_ROUTES.includes(pathname)) return null;

  return (
    <div className="border-b border-edge bg-black">
      <div className="mx-auto flex h-9 w-full max-w-6xl items-center justify-center overflow-hidden px-5">
        <p key={i} className="announce-msg text-center font-mono text-[11px] uppercase tracking-[0.15em] text-ash">
          {MESSAGES[i]}
        </p>
      </div>
    </div>
  );
}
