"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { inr } from "@/lib/format";
import { UmbrellaMark } from "@/components/icons";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function CartPage() {
  const { items, subtotal, count, updateQuantity, removeItem } = useCart();
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-24 text-center">
        <UmbrellaMark className="mx-auto h-14 w-14 text-storm/40" />
        <h1 className="mt-4 font-heading text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-muted">
          Looks like you haven&rsquo;t added anything yet.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-storm px-6 text-sm font-medium text-white transition-colors hover:bg-storm-dark"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  // Free shipping over ₹999 — matches our homepage promise.
  const shipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal + shipping;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Your cart ({count})
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* items */}
        <ul className="divide-y divide-line border-y border-line">
          {items.map((it) => (
            <li key={it.id} className="flex gap-4 py-5">
              <Link
                href={`/product/${it.slug}`}
                className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-line bg-mist"
              >
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-storm/40">
                    <UmbrellaMark className="h-8 w-8" />
                  </span>
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link
                      href={`/product/${it.slug}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {it.name}
                    </Link>
                    {(it.size || it.color) && (
                      <p className="mt-0.5 text-xs text-muted">
                        {[it.size, it.color].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-muted">{inr(it.price)} each</p>
                  </div>
                  <span className="text-sm font-semibold">
                    {inr(it.price * it.quantity)}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-lg border border-line">
                    <button
                      onClick={() => updateQuantity(it.id, it.quantity - 1)}
                      className="h-9 w-9 transition-colors hover:bg-mist"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-9 text-center text-sm">{it.quantity}</span>
                    <button
                      onClick={() => updateQuantity(it.id, it.quantity + 1)}
                      className="h-9 w-9 transition-colors hover:bg-mist"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => setPendingId(it.id)}
                    className="text-xs text-muted transition-colors hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* order summary */}
        <aside className="h-fit rounded-2xl border border-line bg-white p-6">
          <h2 className="font-heading text-lg font-semibold">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{inr(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{shipping === 0 ? "Free" : inr(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted">
                Add {inr(999 - subtotal)} more for free shipping.
              </p>
            )}
            <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{inr(total)}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-storm text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-storm-dark"
          >
            Proceed to checkout
          </Link>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Secure checkout — Payments by Razorpay
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={pendingId !== null}
        title="Remove item?"
        message={`Remove ${
          items.find((i) => i.id === pendingId)?.name ?? "this item"
        } from your cart?`}
        onConfirm={() => {
          if (pendingId) removeItem(pendingId);
          setPendingId(null);
        }}
        onCancel={() => setPendingId(null)}
      />
    </div>
  );
}
