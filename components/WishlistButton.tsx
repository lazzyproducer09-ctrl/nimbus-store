"use client";

import { useWishlist, type WishlistItem } from "@/lib/wishlist-context";
import { HeartIcon } from "./icons";

// The heart button. `icon` variant sits on product cards; `labeled` on the product page.
export function WishlistButton({
  item,
  variant = "icon",
}: {
  item: WishlistItem;
  variant?: "icon" | "labeled";
}) {
  const { has, toggle, hydrated } = useWishlist();
  const active = hydrated && has(item.productId);

  if (variant === "labeled") {
    return (
      <button
        type="button"
        onClick={() => toggle(item)}
        className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors ${
          active
            ? "border-red-200 bg-red-50 text-red-400"
            : "border-edge hover:border-edge"
        }`}
      >
        <HeartIcon className={`h-5 w-5 ${active ? "fill-red-500 text-red-400" : ""}`} />
        {active ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-label={active ? "Remove from wishlist" : "Save to wishlist"}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-chalk shadow-sm transition-transform hover:scale-110"
    >
      <HeartIcon className={`h-4 w-4 ${active ? "fill-red-500 text-red-400" : ""}`} />
    </button>
  );
}
