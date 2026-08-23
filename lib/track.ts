// ---------------------------------------------------------------------------
// One place to fire e-commerce events at Meta Pixel and Google Analytics 4.
//
// Both tags are optional: if the store owner hasn't pasted an ID into the admin
// panel, the globals below simply don't exist and every call here is a no-op.
// Nothing in the shopping flow should ever break because a marketing tag is
// missing, so every function guards and swallows.
// ---------------------------------------------------------------------------

type Fbq = (...args: unknown[]) => void;
type Gtag = (...args: unknown[]) => void;

function fbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { fbq?: Fbq }).fbq ?? null;
}

function gtag(): Gtag | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { gtag?: Gtag }).gtag ?? null;
}

export type TrackedItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
};

const INR = "INR";

function ga4Items(items: TrackedItem[]) {
  return items.map((i) => ({
    item_id: i.productId,
    item_name: i.name,
    price: i.price,
    quantity: i.quantity,
  }));
}

function value(items: TrackedItem[]) {
  return items.reduce((n, i) => n + i.price * i.quantity, 0);
}

/** Someone opened a product page. Meta uses this to build retargeting audiences. */
export function trackViewContent(item: TrackedItem) {
  try {
    fbq()?.("track", "ViewContent", {
      content_ids: [item.productId],
      content_name: item.name,
      content_type: "product",
      value: item.price,
      currency: INR,
    });
    gtag()?.("event", "view_item", {
      currency: INR,
      value: item.price,
      items: ga4Items([item]),
    });
  } catch {
    /* a blocked or half-loaded tag must never interrupt shopping */
  }
}

export function trackAddToCart(item: TrackedItem) {
  try {
    fbq()?.("track", "AddToCart", {
      content_ids: [item.productId],
      content_name: item.name,
      content_type: "product",
      value: item.price * item.quantity,
      currency: INR,
    });
    gtag()?.("event", "add_to_cart", {
      currency: INR,
      value: item.price * item.quantity,
      items: ga4Items([item]),
    });
  } catch {
    /* ignore */
  }
}

export function trackInitiateCheckout(items: TrackedItem[]) {
  try {
    fbq()?.("track", "InitiateCheckout", {
      content_ids: items.map((i) => i.productId),
      content_type: "product",
      num_items: items.reduce((n, i) => n + i.quantity, 0),
      value: value(items),
      currency: INR,
    });
    gtag()?.("event", "begin_checkout", {
      currency: INR,
      value: value(items),
      items: ga4Items(items),
    });
  } catch {
    /* ignore */
  }
}

/**
 * A payment actually succeeded.
 *
 * `total` is the amount really charged (after shipping and any coupon), not the
 * cart subtotal — otherwise the ad platform optimises against a number the
 * business never received.
 */
export function trackPurchase(orderId: string, total: number, items: TrackedItem[]) {
  try {
    fbq()?.("track", "Purchase", {
      content_ids: items.map((i) => i.productId),
      content_type: "product",
      num_items: items.reduce((n, i) => n + i.quantity, 0),
      value: total,
      currency: INR,
    });
    gtag()?.("event", "purchase", {
      transaction_id: orderId,
      currency: INR,
      value: total,
      items: ga4Items(items),
    });
  } catch {
    /* ignore */
  }
}
