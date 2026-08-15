"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { inr } from "@/lib/format";
import { OffbeatMark } from "@/components/icons";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function CartPage() {
  const {
    items,
    count,
    selectedItems,
    selectedCount,
    selectedSubtotal,
    updateQuantity,
    removeItem,
    toggleSelected,
    setAllSelected,
  } = useCart();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-24 text-center">
        <OffbeatMark className="mx-auto h-14 w-14 text-volt/50" />
        <h1 className="mt-4 font-heading text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-sm text-ash">
          Nothing weird in here yet. Let&rsquo;s fix that.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-volt px-6 text-sm font-semibold text-void shadow-[0_0_30px_-10px_var(--color-volt)] transition-colors hover:bg-volt-dim"
        >
          Start shopping
        </Link>
      </div>
    );
  }

  // Free shipping over ₹999 — matches our homepage promise. Only SELECTED items count.
  // Nothing selected → no shipping charge shown.
  const shipping = selectedSubtotal > 0 && selectedSubtotal < 999 ? 79 : 0;
  const total = selectedSubtotal + shipping;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <h1 className="font-heading text-3xl font-bold tracking-tight">
        Your cart ({count})
      </h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_360px]">
        {/* items */}
        <div>
          <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-ash">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={(e) => setAllSelected(e.target.checked)}
              className="h-4 w-4 accent-volt"
            />
            Select all ({selectedItems.length}/{items.length})
          </label>
          <ul className="divide-y divide-edge border-y border-edge">
          {items.map((it) => (
            <li
              key={it.id}
              className={`flex gap-4 py-5 transition-opacity ${it.selected ? "" : "opacity-55"}`}
            >
              <input
                type="checkbox"
                checked={it.selected}
                onChange={() => toggleSelected(it.id)}
                aria-label={`Select ${it.name}`}
                className="mt-1 h-5 w-5 flex-shrink-0 accent-volt"
              />
              <Link
                href={`/product/${it.slug}`}
                className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-edge bg-surface"
              >
                {it.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center text-volt/40">
                    <OffbeatMark className="h-8 w-8" />
                  </span>
                )}
              </Link>

              <div className="flex flex-1 flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <Link
                      href={`/product/${it.slug}`}
                      className="text-sm font-medium text-chalk hover:text-volt"
                    >
                      {it.name}
                    </Link>
                    {(it.size || it.color) && (
                      <p className="mt-0.5 text-xs text-ash">
                        {[it.size, it.color].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-ash">{inr(it.price)} each</p>
                  </div>
                  <span className="text-sm font-semibold text-chalk">
                    {inr(it.price * it.quantity)}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-lg border border-edge">
                    <button
                      onClick={() => updateQuantity(it.id, it.quantity - 1)}
                      className="h-9 w-9 transition-colors hover:bg-surface"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="w-9 text-center text-sm">{it.quantity}</span>
                    <button
                      onClick={() => updateQuantity(it.id, it.quantity + 1)}
                      className="h-9 w-9 transition-colors hover:bg-surface"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => setPendingId(it.id)}
                    className="text-xs text-ash transition-colors hover:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
          </ul>
        </div>

        {/* order summary */}
        <aside className="h-fit rounded-2xl border border-edge bg-coal p-6">
          <h2 className="font-heading text-lg font-bold">Order summary</h2>
          <p className="mt-1 text-xs text-ash">
            {selectedCount} item{selectedCount === 1 ? "" : "s"} selected
          </p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ash">Subtotal</span>
              <span className="text-chalk">{inr(selectedSubtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ash">Shipping</span>
              <span className="text-chalk">{shipping === 0 ? "Free" : inr(shipping)}</span>
            </div>
            {shipping > 0 && selectedSubtotal > 0 && (
              <p className="text-xs text-volt">
                Add {inr(999 - selectedSubtotal)} more for free shipping.
              </p>
            )}
            <div className="mt-2 flex justify-between border-t border-edge pt-3 text-base font-semibold">
              <span>Total</span>
              <span className="text-chalk">{inr(total)}</span>
            </div>
          </div>

          {selectedCount === 0 ? (
            <button
              disabled
              className="mt-5 flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full bg-surface text-sm font-medium text-ash-dim"
            >
              Select items to checkout
            </button>
          ) : (
            <Link
              href="/checkout"
              className="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-volt text-sm font-semibold text-void shadow-[0_0_30px_-10px_var(--color-volt)] transition-all hover:-translate-y-0.5 hover:bg-volt-dim"
            >
              Checkout ({selectedCount}) · {inr(total)}
            </Link>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-ash">
            <span className="h-1.5 w-1.5 rounded-full bg-volt" />
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
