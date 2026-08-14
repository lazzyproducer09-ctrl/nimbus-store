"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { OffbeatMark } from "./icons";

// The site-wide footer. Hidden on the minimal login / signup pages.
export function Footer() {
  const pathname = usePathname();
  if (["/login", "/signup", "/welcome", "/forgot-password", "/reset-password", "/verify-email"].includes(pathname)) return null;

  return (
    <footer className="border-t border-edge bg-coal text-chalk">
      <div className="mx-auto w-full max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <OffbeatMark className="h-5 w-5 text-volt" />
              <span className="font-heading text-lg font-extrabold tracking-[0.28em]">OFFBEAT</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-ash">
              Offbeat, unexpected, impossibly cool things — for people who refuse
              boring. Curated & shipped across India.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-ash">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm text-ash">
              <li><Link href="/shop?sort=newest" className="transition-colors hover:text-volt">New in</Link></li>
              <li><Link href="/shop?sort=rating" className="transition-colors hover:text-volt">Best sellers</Link></li>
              <li><Link href="/shop" className="transition-colors hover:text-volt">Shop all</Link></li>
              <li><Link href="/#categories" className="transition-colors hover:text-volt">Categories</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-ash">Help</h4>
            <ul className="mt-4 space-y-2 text-sm text-ash">
              <li><Link href="/shipping" className="transition-colors hover:text-volt">Shipping</Link></li>
              <li><Link href="/refund" className="transition-colors hover:text-volt">Returns &amp; Refunds</Link></li>
              <li><Link href="/orders" className="transition-colors hover:text-volt">Track order</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-volt">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-ash">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-ash">
              <li><Link href="/contact" className="transition-colors hover:text-volt">About</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-volt">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-volt">Terms</Link></li>
              <li><Link href="/refund" className="transition-colors hover:text-volt">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* trust + accepted payments */}
        <div className="mt-12 flex flex-col gap-4 border-t border-edge pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-ash">We accept</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["UPI", "Visa", "Mastercard", "RuPay", "Net Banking", "COD"].map((m) => (
                <span
                  key={m}
                  className="rounded-md border border-edge bg-surface px-2.5 py-1 text-[11px] font-medium text-ash"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-ash">
            <span>🇮🇳 Ships across India</span>
            <span>🔒 SSL secured</span>
            <span>✓ Genuine products</span>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-edge pt-6 text-xs text-ash-dim md:flex-row">
          <span>© 2026 OFFBEAT. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-volt" />
            Secure checkout — payments secured by Razorpay
          </span>
        </div>
      </div>
    </footer>
  );
}
