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
        /* was a near-white bg-red-50 with text-red-400 — pale on pale */
        className={`inline-flex h-12 items-center justify-center gap-2 rounded-full border px-5 text-sm font-medium transition-colors ${
          active
            ? "border-bad/40 bg-bad-deep text-bad"
            : "border-edge text-chalk hover:border-volt/50 hover:text-volt"
        }`}
      >
        <HeartIcon className={`h-5 w-5 ${active ? "fill-current" : ""}`} />
        {active ? "Saved" : "Save"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-label={active ? "Remove from wishlist" : "Save to wishlist"}
      /* was bg-white/90 + text-chalk — a near-white icon on a white circle,
         so the unsaved heart was effectively invisible on every product card */
      className={`flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-sm transition-all hover:scale-110 ${
        active
          ? "border-bad/50 bg-void/80 text-bad"
          : "border-white/15 bg-void/60 text-chalk hover:border-volt/60 hover:text-volt"
      }`}
    >
      <HeartIcon className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
    </button>
  );
}
