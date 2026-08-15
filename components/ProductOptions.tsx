"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

// The size / colour / quantity pickers and the Add-to-Cart / Buy-Now buttons.
export function ProductOptions({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem, items, openCart, updateQuantity, removeItem, setBuyNow } = useCart();
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

  // Buy now: purchase this item directly, without adding it to the cart.
  function buyNow() {
    setBuyNow({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? null,
      size,
      color,
      quantity: qty,
    });
    router.push("/checkout?buynow=1");
  }

  return (
    <div className="mt-8 space-y-6">
      {product.sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-chalk">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`h-10 min-w-10 rounded-lg border px-3 text-sm transition-colors ${
                  size === s
                    ? "border-volt bg-volt text-void font-medium"
                    : "border-edge text-ash hover:border-volt/50 hover:text-chalk"
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
          <p className="text-sm font-medium text-chalk">Colour</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`h-10 rounded-lg border px-4 text-sm transition-colors ${
                  color === c
                    ? "border-volt bg-volt text-void font-medium"
                    : "border-edge text-ash hover:border-volt/50 hover:text-chalk"
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
          <p className="text-sm font-medium text-chalk">Quantity</p>
          <div className="mt-2 inline-flex items-center rounded-lg border border-edge text-chalk">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-10 w-10 text-lg transition-colors hover:bg-surface"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center text-sm">{qty}</span>
            <button
              onClick={() => setQty((q) => q + 1)}
              className="h-10 w-10 text-lg transition-colors hover:bg-surface"
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
          <div className="flex items-center justify-between rounded-full border border-volt/60 bg-volt-deep px-2 py-1.5">
            <button
              onClick={() => updateQuantity(cartLine.id, cartLine.quantity - 1)}
              className="flex h-9 w-11 items-center justify-center rounded-full text-xl text-volt transition-colors hover:bg-surface"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="text-sm font-medium text-volt">
              {cartLine.quantity} in cart
            </span>
            <button
              onClick={() => updateQuantity(cartLine.id, cartLine.quantity + 1)}
              className="flex h-9 w-11 items-center justify-center rounded-full text-xl text-volt transition-colors hover:bg-surface"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={openCart}
              className="h-12 flex-1 rounded-full bg-volt text-sm font-semibold text-void shadow-[0_0_30px_-10px_var(--color-volt)] transition-all hover:-translate-y-0.5 hover:bg-volt-dim active:translate-y-0"
            >
              View cart
            </button>
            <button
              onClick={() => removeItem(cartLine.id)}
              className="h-12 flex-1 rounded-full border border-edge text-sm font-medium text-ash transition-all hover:-translate-y-0.5 hover:border-red-400/60 hover:text-red-400 active:translate-y-0"
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
            className="h-12 flex-1 rounded-full bg-volt text-sm font-semibold text-void shadow-[0_0_30px_-10px_var(--color-volt)] transition-all hover:-translate-y-0.5 hover:bg-volt-dim active:translate-y-0 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
          >
            {outOfStock ? "Out of stock" : "Add to cart"}
          </button>
          <button
            onClick={buyNow}
            disabled={outOfStock}
            className="h-12 flex-1 rounded-full border border-edge text-sm font-medium text-chalk transition-all hover:-translate-y-0.5 hover:border-volt/50 hover:text-volt active:translate-y-0 disabled:opacity-40"
          >
            Buy now
          </button>
        </div>
      )}
    </div>
  );
}
