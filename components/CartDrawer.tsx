"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { inr } from "@/lib/format";
import { YoinkMark } from "./icons";
import { ConfirmDialog } from "./ConfirmDialog";

// The slide-out cart panel. Always mounted; it slides in/out based on `isOpen`.
export function CartDrawer() {
  const {
    items,
    selectedSubtotal,
    isOpen,
    closeCart,
    count,
    updateQuantity,
    removeItem,
    toggleSelected,
  } = useCart();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const pathname = usePathname();

  // Whenever the page changes, close the cart so it never lingers on another page.
  useEffect(() => {
    closeCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* dim backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      {/* sliding panel */}
      <aside
        role="dialog"
        aria-label="Shopping cart"
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-edge bg-coal text-chalk shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-edge px-5 py-4">
          <h2 className="font-heading text-lg font-bold">Your cart ({count})</h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-lg text-ash transition-colors hover:text-chalk"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
            <YoinkMark className="h-12 w-12 text-volt/50" />
            <p className="text-sm text-ash">Nothing here yet. Go find something weird.</p>
            <button
              onClick={closeCart}
              className="font-mono text-xs uppercase tracking-wider text-volt hover:underline"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((it) => (
                  <li key={it.id} className={`flex gap-3 ${it.selected ? "" : "opacity-55"}`}>
                    <input
                      type="checkbox"
                      checked={it.selected}
                      onChange={() => toggleSelected(it.id)}
                      aria-label={`Select ${it.name}`}
                      className="mt-1 h-4 w-4 flex-shrink-0 accent-volt"
                    />
                    <Link
                      href={`/product/${it.slug}`}
                      onClick={closeCart}
                      className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-edge bg-surface"
                    >
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-volt/40">
                          <YoinkMark className="h-6 w-6" />
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-medium leading-snug text-chalk">{it.name}</p>
                        <button
                          onClick={() => setPendingId(it.id)}
                          className="text-xs text-ash transition-colors hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                      {(it.size || it.color) && (
                        <p className="text-xs text-ash">
                          {[it.size, it.color].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="inline-flex items-center rounded-lg border border-edge">
                          <button
                            onClick={() => updateQuantity(it.id, it.quantity - 1)}
                            className="h-8 w-8 transition-colors hover:bg-surface"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm">{it.quantity}</span>
                          <button
                            onClick={() => updateQuantity(it.id, it.quantity + 1)}
                            className="h-8 w-8 transition-colors hover:bg-surface"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-chalk">
                          {inr(it.price * it.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-edge px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-ash">Selected subtotal</span>
                <span className="font-semibold text-chalk">{inr(selectedSubtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-ash">
                Tick items to include them. Shipping &amp; taxes at checkout.
              </p>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-4 flex h-11 items-center justify-center rounded-full bg-volt text-sm font-semibold text-void shadow-[0_0_30px_-10px_var(--color-volt)] transition-colors hover:bg-volt-dim"
              >
                View cart &amp; checkout
              </Link>
              <button
                onClick={closeCart}
                className="mt-2 flex h-9 w-full items-center justify-center text-xs text-ash hover:text-chalk"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>

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
    </>
  );
}
