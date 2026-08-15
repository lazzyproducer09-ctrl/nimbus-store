"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlist-context";
import { HeartIcon } from "./icons";

// Header wishlist icon with a live count + "Wishlist" label.
export function WishlistHeaderButton() {
  const { count, hydrated } = useWishlist();
  return (
    <Link
      href="/wishlist"
      aria-label="Wishlist"
      className="group relative flex flex-col items-center transition-transform hover:scale-110"
    >
      <HeartIcon className="h-5 w-5" />
      <span className="mt-0.5 text-[10px] text-ash group-hover:text-chalk">Wishlist</span>
      {hydrated && count > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
