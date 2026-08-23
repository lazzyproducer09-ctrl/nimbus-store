"use client";

import { inr } from "@/lib/format";
import { TruckIcon, CheckIcon } from "./icons";

// ---------------------------------------------------------------------------
// "₹240 away from free shipping" progress bar.
//
// One of the few reliably effective ways to lift average order value: the
// shopper is already buying, and topping up costs them less than the delivery
// fee they'd otherwise pay. Shown in the cart drawer and on the cart page.
//
// The threshold is whatever the admin set — the same number the server charges
// against, so this can never promise free delivery the checkout won't honour.
// ---------------------------------------------------------------------------

export function FreeShippingBar({
  subtotal,
  threshold,
  className = "",
}: {
  subtotal: number;
  threshold: number;
  className?: string;
}) {
  if (threshold <= 0) return null;

  const unlocked = subtotal >= threshold;
  const remaining = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, Math.round((subtotal / threshold) * 100));

  return (
    <div className={`rounded-xl border border-edge bg-surface/40 p-3 ${className}`}>
      <p className="flex items-center gap-2 text-xs">
        {unlocked ? (
          <>
            <CheckIcon className="h-4 w-4 flex-shrink-0 text-good" />
            <span className="font-medium text-good">Free shipping unlocked</span>
          </>
        ) : (
          <>
            <TruckIcon className="h-4 w-4 flex-shrink-0 text-volt" />
            <span className="text-ash">
              <span className="font-medium text-chalk">{inr(remaining)}</span> away from free
              shipping
            </span>
          </>
        )}
      </p>
      <div
        className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-edge"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progress towards free shipping"
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            unlocked ? "bg-good" : "bg-volt"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
