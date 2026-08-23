"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { readRecentlyViewed, recordView } from "@/lib/recently-viewed";
import { trackViewContent } from "@/lib/track";
import type { Product } from "@/lib/products";
import { ProductCard } from "./ProductCard";

/**
 * Drop this on a product page to record the visit.
 *
 * Renders nothing. It exists because the product page is server-rendered and
 * these two jobs — writing to localStorage and firing the ViewContent pixel
 * event that Meta builds retargeting audiences from — can only happen in the
 * browser.
 */
export function RecordProductView({
  productId,
  name,
  price,
}: {
  productId: string;
  name: string;
  price: number;
}) {
  useEffect(() => {
    recordView(productId);
    trackViewContent({ productId, name, price, quantity: 1 });
  }, [productId, name, price]);
  return null;
}

/**
 * The strip of products this browser looked at before.
 *
 * `excludeId` keeps the product you're currently reading out of its own list.
 * Rows are re-fetched from the catalogue rather than cached locally, so a
 * price change or a deleted product is reflected immediately.
 */
export function RecentlyViewed({ excludeId }: { excludeId?: string }) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const ids = readRecentlyViewed().filter((id) => id !== excludeId);
    if (ids.length === 0) return;

    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .in("id", ids)
        .eq("is_active", true);
      if (cancelled || !data) return;
      // Keep the browsing order (most recent first); the DB returns any order.
      const byId = new Map(data.map((p) => [p.id, p as Product]));
      setProducts(ids.map((id) => byId.get(id)).filter((p): p is Product => !!p));
    })();

    return () => {
      cancelled = true;
    };
  }, [excludeId]);

  if (products.length === 0) return null;

  return (
    <section className="mt-16 border-t border-edge pt-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-volt">Still thinking?</p>
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-chalk">
            You were looking at these
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {products.slice(0, 4).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
