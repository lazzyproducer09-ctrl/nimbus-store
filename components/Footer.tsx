"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UmbrellaMark } from "./icons";

// The site-wide footer. Hidden on the minimal login / signup pages.
export function Footer() {
  const pathname = usePathname();
  if (["/login", "/signup", "/welcome", "/forgot-password", "/reset-password", "/verify-email"].includes(pathname)) return null;

  return (
    <footer className="border-t border-line bg-ink text-paper">
      <div className="mx-auto w-full max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <UmbrellaMark className="h-5 w-5" />
              <span className="font-heading text-lg font-semibold tracking-[0.25em]">NIMBUS</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-paper/60">
              Premium rainwear, designed in India for the Indian monsoon.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Shop</h4>
            <ul className="mt-4 space-y-2 text-sm text-paper/60">
              <li><Link href="/shop?category=Raincoats" className="transition-colors hover:text-paper">Raincoats</Link></li>
              <li><Link href="/shop?category=Umbrellas" className="transition-colors hover:text-paper">Umbrellas</Link></li>
              <li><Link href="/shop?category=Rain Boots" className="transition-colors hover:text-paper">Rain Boots</Link></li>
              <li><Link href="/shop?category=Accessories" className="transition-colors hover:text-paper">Accessories</Link></li>
            </ul>
          </div>

          {/* These pages are built in a later milestone */}
          <div>
            <h4 className="text-sm font-semibold">Help</h4>
            <ul className="mt-4 space-y-2 text-sm text-paper/60">
              <li><Link href="/shipping" className="transition-colors hover:text-paper">Shipping</Link></li>
              <li><Link href="/refund" className="transition-colors hover:text-paper">Returns &amp; Refunds</Link></li>
              <li><Link href="/orders" className="transition-colors hover:text-paper">Track order</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-paper">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-4 space-y-2 text-sm text-paper/60">
              <li><Link href="/contact" className="transition-colors hover:text-paper">About</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-paper">Privacy Policy</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-paper">Terms</Link></li>
              <li><Link href="/refund" className="transition-colors hover:text-paper">Refund Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-paper/10 pt-6 text-xs text-paper/50 md:flex-row">
          <span>© 2026 NIMBUS. All rights reserved.</span>
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Secure checkout — Payments secured by Razorpay
          </span>
        </div>
      </div>
    </footer>
  );
}
