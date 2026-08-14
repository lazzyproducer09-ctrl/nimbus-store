"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/products";
import { inr } from "@/lib/format";
import { useCart } from "@/lib/cart-context";
import { UmbrellaMark } from "./icons";
import { WishlistButton } from "./WishlistButton";

// One product card. Image + name link to the product page; an "Add to cart"
// control (which becomes a − quantity + stepper) sits at the bottom.
export function ProductCard({ product: p }: { product: Product }) {
  const router = useRouter();
  const { addItem, items, updateQuantity, setBuyNow } = useCart();
  const [hovering, setHovering] = useState(false);
  const hoverImage = p.images[1];
  const shownImage = hovering && hoverImage ? hoverImage : p.images[0];

  const discount = p.compare_at_price
    ? Math.round((1 - p.price / p.compare_at_price) * 100)
    : 0;
  const lowStock = p.stock > 0 && p.stock <= 5;

  // Quick-add uses the first size/colour as defaults (change them on the product page).
  const size = p.sizes[0] ?? null;
  const color = p.colors[0] ?? null;
  const lineId = `${p.id}__${size ?? ""}__${color ?? ""}`;
  const cartLine = items.find((i) => i.id === lineId);

  function add() {
    addItem(
      {
        productId: p.id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        image: p.images[0] ?? null,
        size,
        color,
      },
      1,
    );
  }

  // Buy now: purchase THIS item directly, without touching the cart.
  function buyNow() {
    setBuyNow({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      price: p.price,
      image: p.images[0] ?? null,
      size,
      color,
      quantity: 1,
    });
    router.push("/checkout?buynow=1");
  }

  return (
    <div className="group relative flex flex-col">
      {/* wishlist heart (sits over the image, not part of the link) */}
      <div className="absolute right-3 top-3 z-20">
        <WishlistButton
          item={{
            productId: p.id,
            slug: p.slug,
            name: p.name,
            price: p.price,
            compare_at_price: p.compare_at_price,
            image: p.images[0] ?? null,
            rating: p.rating,
            review_count: p.review_count,
          }}
        />
      </div>
      <Link
        href={`/product/${p.slug}`}
        className="block"
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-mist shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
          {p.tag && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-ink shadow-sm">
              {p.tag}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute bottom-3 left-3 z-10 rounded-full bg-storm px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
          {shownImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shownImage}
              alt={p.name}
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-200"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-storm/50 transition-transform duration-500 group-hover:scale-105">
              <UmbrellaMark className="h-12 w-12" />
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <Link href={`/product/${p.slug}`}>
            <h3 className="text-sm font-medium leading-snug hover:underline">{p.name}</h3>
          </Link>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted">
            <span className="text-storm">★</span>
            <span className="text-ink">{p.rating}</span>
            <span>({p.review_count})</span>
          </div>
          {lowStock && (
            <p className="mt-1 text-[11px] font-medium text-red-600">
              Only {p.stock} left
            </p>
          )}
        </div>
        <div className="text-right">
          <span className="block whitespace-nowrap text-sm font-semibold">{inr(p.price)}</span>
          {p.compare_at_price && (
            <span className="block text-xs text-muted line-through">
              {inr(p.compare_at_price)}
            </span>
          )}
        </div>
      </div>

      {/* Add-to-cart + Buy-now controls */}
      <div className="mt-2 space-y-2">
        {cartLine ? (
          <div className="flex h-9 items-center justify-between rounded-full border border-storm text-storm">
            <button
              onClick={() => updateQuantity(lineId, cartLine.quantity - 1)}
              className="flex h-9 w-10 items-center justify-center rounded-l-full text-lg transition-colors hover:bg-storm-tint"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="text-sm font-medium">{cartLine.quantity} in cart</span>
            <button
              onClick={() => updateQuantity(lineId, cartLine.quantity + 1)}
              className="flex h-9 w-10 items-center justify-center rounded-r-full text-lg transition-colors hover:bg-storm-tint"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        ) : (
          <button
            onClick={add}
            className="h-9 w-full rounded-full border border-ink/15 text-sm font-medium transition-colors hover:border-storm hover:text-storm"
          >
            Add to cart
          </button>
        )}
        <button
          onClick={buyNow}
          className="h-9 w-full rounded-full bg-storm text-sm font-medium text-white transition-colors hover:bg-storm-dark"
        >
          Buy now
        </button>
      </div>
    </div>
  );
}
