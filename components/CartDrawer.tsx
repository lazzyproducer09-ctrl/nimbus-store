"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { inr } from "@/lib/format";
import { UmbrellaMark } from "./icons";
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
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-paper shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-heading text-lg font-semibold">Your cart ({count})</h2>
          <button
            onClick={closeCart}
            aria-label="Close cart"
            className="text-lg text-muted transition-colors hover:text-ink"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
            <UmbrellaMark className="h-12 w-12 text-storm/40" />
            <p className="text-sm text-muted">Your cart is empty.</p>
            <button
              onClick={closeCart}
              className="text-sm font-medium text-storm hover:underline"
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
                      className="mt-1 h-4 w-4 flex-shrink-0 accent-storm"
                    />
                    <Link
                      href={`/product/${it.slug}`}
                      onClick={closeCart}
                      className="relative h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-mist"
                    >
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.image} alt={it.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-storm/40">
                          <UmbrellaMark className="h-6 w-6" />
                        </span>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <p className="text-sm font-medium leading-snug">{it.name}</p>
                        <button
                          onClick={() => setPendingId(it.id)}
                          className="text-xs text-muted transition-colors hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                      {(it.size || it.color) && (
                        <p className="text-xs text-muted">
                          {[it.size, it.color].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <div className="inline-flex items-center rounded-lg border border-line">
                          <button
                            onClick={() => updateQuantity(it.id, it.quantity - 1)}
                            className="h-8 w-8 transition-colors hover:bg-mist"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm">{it.quantity}</span>
                          <button
                            onClick={() => updateQuantity(it.id, it.quantity + 1)}
                            className="h-8 w-8 transition-colors hover:bg-mist"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-sm font-semibold">
                          {inr(it.price * it.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-line px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Selected subtotal</span>
                <span className="font-semibold">{inr(selectedSubtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted">
                Tick items to include them. Shipping &amp; taxes at checkout.
              </p>
              <Link
                href="/cart"
                onClick={closeCart}
                className="mt-4 flex h-11 items-center justify-center rounded-full bg-storm text-sm font-medium text-white transition-colors hover:bg-storm-dark"
              >
                View cart &amp; checkout
              </Link>
              <button
                onClick={closeCart}
                className="mt-2 flex h-9 w-full items-center justify-center text-xs text-muted hover:text-ink"
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
