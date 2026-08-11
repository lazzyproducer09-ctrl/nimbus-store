"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

// The size / colour / quantity pickers and the Add-to-Cart / Buy-Now buttons.
export function ProductOptions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, items, openCart, updateQuantity, removeItem, selectOnly } = useCart();
  const [size, setSize] = useState<string | null>(product.sizes[0] ?? null);
  const [color, setColor] = useState<string | null>(product.colors[0] ?? null);
  const [qty, setQty] = useState(1);

  const outOfStock = product.stock <= 0;

  // Is THIS exact variant (product + size + colour) already in the cart?
  const lineId = `${product.id}__${size ?? ""}__${color ?? ""}`;
  const cartLine = items.find((i) => i.id === lineId);

  function add() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? null,
        size,
        color,
      },
      qty,
    );
    setQty(1);
  }

  function buyNow() {
    if (!cartLine) {
      addItem(
        {
          productId: product.id,
          slug: product.slug,
          name: product.name,
          price: product.price,
          image: product.images[0] ?? null,
          size,
          color,
        },
        qty,
      );
    }
    // Tick only this item, then head straight to checkout.
    selectOnly(lineId);
    router.push("/checkout");
  }

  return (
    <div className="mt-8 space-y-6">
      {product.sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`h-10 min-w-10 rounded-lg border px-3 text-sm transition-colors ${
                  size === s
                    ? "border-storm bg-storm text-white"
                    : "border-line hover:border-ink/40"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.colors.length > 0 && (
        <div>
          <p className="text-sm font-medium">Colour</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-10 rounded-lg border px-4 text-sm transition-colors ${
                  color === c
                    ? "border-storm bg-storm text-white"
                    : "border-line hover:border-ink/40"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity picker — only shown before the item is in the cart.
          Once it's in the cart, you adjust the quantity in the cart itself. */}
      {!cartLine && (
        <div>
          <p className="text-sm font-medium">Quantity</p>
          <div className="mt-2 inline-flex items-center rounded-lg border border-line">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-10 w-10 text-lg transition-colors hover:bg-mist"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center text-sm">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="h-10 w-10 text-lg transition-colors hover:bg-mist"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      )}

      {cartLine ? (
        // Already in cart → adjust quantity or remove it right here.
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-full border border-storm bg-storm-tint px-2 py-1.5">
            <button
              onClick={() => updateQuantity(cartLine.id, cartLine.quantity - 1)}
              className="flex h-9 w-11 items-center justify-center rounded-full text-xl text-storm transition-colors hover:bg-white"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="text-sm font-medium text-storm">
              {cartLine.quantity} in cart
            </span>
            <button
              onClick={() => updateQuantity(cartLine.id, cartLine.quantity + 1)}
              className="flex h-9 w-11 items-center justify-center rounded-full text-xl text-storm transition-colors hover:bg-white"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={openCart}
              className="h-12 flex-1 rounded-full bg-ink text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-storm active:translate-y-0"
            >
              View cart
            </button>
            <button
              onClick={() => removeItem(cartLine.id)}
              className="h-12 flex-1 rounded-full border border-ink/15 text-sm font-medium text-muted transition-all hover:-translate-y-0.5 hover:border-red-300 hover:text-red-600 active:translate-y-0"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={add}
            disabled={outOfStock}
            className="h-12 flex-1 rounded-full bg-ink text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-storm active:translate-y-0 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {outOfStock ? "Out of stock" : "Add to cart"}
          </button>
          <button
            onClick={buyNow}
            disabled={outOfStock}
            className="h-12 flex-1 rounded-full border border-ink/15 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-ink/40 active:translate-y-0 disabled:opacity-40"
          >
            Buy now
          </button>
        </div>
      )}
    </div>
  );
}
