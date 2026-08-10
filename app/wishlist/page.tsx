"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlist-context";
import { useCart } from "@/lib/cart-context";
import { inr } from "@/lib/format";
import { UmbrellaMark } from "@/components/icons";

export default function WishlistPage() {
  const { items, remove, hydrated } = useWishlist();
  const { addItem } = useCart();

  if (!hydrated) {
    return <div className="mx-auto w-full max-w-6xl px-5 py-16" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-24 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
          ♡
        </div>
        <h1 className="mt-4 font-heading text-2xl font-semibold">Your wishlist is empty</h1>
        <p className="mt-2 text-sm text-muted">
          Tap the heart on any product to save it for later.
        </p>
        <Link
          href="/shop"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-storm px-6 text-sm font-medium text-white transition-colors hover:bg-storm-dark"
        >
          Explore products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Your wishlist
      </h1>
      <p className="mt-1 text-sm text-muted">
        {items.length} saved item{items.length === 1 ? "" : "s"}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-5 md:grid-cols-4">
        {items.map((p) => (
          <div key={p.productId} className="group flex flex-col">
            <Link href={`/product/${p.slug}`} className="block">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-mist shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.name}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-storm/50">
                    <UmbrellaMark className="h-12 w-12" />
                  </div>
                )}
              </div>
            </Link>

            <div className="mt-3 flex items-start justify-between gap-2">
              <Link href={`/product/${p.slug}`}>
                <h3 className="text-sm font-medium leading-snug hover:underline">{p.name}</h3>
              </Link>
              <span className="whitespace-nowrap text-sm font-semibold">{inr(p.price)}</span>
            </div>

            <div className="mt-2 flex gap-2">
              <button
                onClick={() => {
                  addItem({
                    productId: p.productId,
                    slug: p.slug,
                    name: p.name,
                    price: p.price,
                    image: p.image,
                    size: null,
                    color: null,
                  });
                  remove(p.productId);
                }}
                className="h-9 flex-1 rounded-full bg-ink text-xs font-medium text-white transition-colors hover:bg-storm"
              >
                Add to cart
              </button>
              <button
                onClick={() => remove(p.productId)}
                aria-label="Remove"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-muted transition-colors hover:border-red-300 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
