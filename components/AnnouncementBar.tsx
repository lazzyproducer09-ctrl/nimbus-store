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
  "🚚  Free shipping on orders over ₹999",
  "↩️  Easy 7-day returns — no questions asked",
  "💵  Cash on delivery available across India",
  "🔒  100% secure payments via Razorpay",
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
    <div className="bg-ink text-paper">
      <div className="mx-auto flex h-9 w-full max-w-6xl items-center justify-center overflow-hidden px-5">
        <p key={i} className="announce-msg text-center text-xs font-medium text-paper/85">
          {MESSAGES[i]}
        </p>
      </div>
    </div>
  );
}
