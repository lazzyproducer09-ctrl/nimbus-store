// ---------------------------------------------------------------------------
// Pure pricing rules: shipping and discount codes.
//
// Deliberately free of imports so the browser, the API routes and a plain
// `node` test run can all use the exact same functions. Anything that touches
// the database lives in store-settings.ts, which re-exports these.
// ---------------------------------------------------------------------------

export type Coupon = {
  code: string;
  /** "percent" takes value% off the subtotal, "flat" takes ₹value off */
  type: "percent" | "flat";
  value: number;
  /** minimum subtotal (₹) before the code is allowed. 0 = no minimum */
  minOrder: number;
  active: boolean;
};

export type PricingRules = {
  freeShippingThreshold: number;
  shippingFee: number;
  coupons: Coupon[];
};

/** Shipping fee for a subtotal. Used by the cart, the checkout AND the server. */
export function shippingFor(
  subtotal: number,
  rules: Pick<PricingRules, "freeShippingThreshold" | "shippingFee">,
): number {
  return subtotal >= rules.freeShippingThreshold ? 0 : rules.shippingFee;
}

export type CouponResult =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; error: string };

/**
 * Validate a code against a subtotal and work out the discount.
 *
 * The browser calls this through /api/coupon for a preview, and the
 * create-order route calls it again against its own server-side subtotal
 * before charging — so a hand-edited discount in the browser is ignored.
 */
export function applyCoupon(
  code: string,
  subtotal: number,
  rules: Pick<PricingRules, "coupons">,
): CouponResult {
  const wanted = code.trim().toUpperCase();
  if (!wanted) return { ok: false, error: "Enter a code." };

  const coupon = rules.coupons.find((c) => c.code === wanted);
  if (!coupon || !coupon.active) return { ok: false, error: "That code isn't valid." };
  if (subtotal < coupon.minOrder) {
    return { ok: false, error: `This code needs an order of ₹${coupon.minOrder} or more.` };
  }

  const raw =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.round(coupon.value);
  // Never let a discount exceed the subtotal (a flat ₹500 off a ₹300 cart).
  const discount = Math.max(0, Math.min(raw, subtotal));
  if (discount <= 0) return { ok: false, error: "That code isn't valid." };

  return { ok: true, coupon, discount };
}
