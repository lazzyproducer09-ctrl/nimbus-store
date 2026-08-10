"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart-context";
import { BagIcon } from "./icons";

// The cart icon in the header: shows the item count and "bumps" when items are added.
export function CartButton() {
  const { count, openCart, hydrated } = useCart();
  const [bump, setBump] = useState(false);
  const prev = useRef(count);

  useEffect(() => {
    if (count > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      prev.current = count;
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count]);

  return (
    <button
      onClick={openCart}
      aria-label="Open cart"
      className="relative transition-transform hover:scale-110"
    >
      <BagIcon className={`h-5 w-5 ${bump ? "cart-bump" : ""}`} />
      {hydrated && count > 0 && (
        <span
          className={`absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-storm px-1 text-[10px] font-semibold text-white ${
            bump ? "cart-bump" : ""
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
