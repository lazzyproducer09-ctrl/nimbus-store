import { getSetting } from "./settings";
import type { Coupon, PricingRules } from "./coupon-math";

// The pure pricing rules live in coupon-math.ts (no imports, so tests and the
// browser can use them directly). Re-exported here so callers have one entry point.
export { shippingFor, applyCoupon } from "./coupon-math";
export type { Coupon, CouponResult } from "./coupon-math";

// ---------------------------------------------------------------------------
// Commerce / operations settings.
//
// Separate from site-content.ts on purpose: that file is COPY (what the page
// says), this one is BEHAVIOUR (what the store charges, which pixel fires,
// which coupons work). Both live as JSON in site_settings so no migration is
// needed, but mixing them would make it easy to break checkout while editing a
// headline.
// ---------------------------------------------------------------------------

export type StoreSettings = PricingRules & {
  /** digits only, with country code, e.g. 919876543210. Empty = button hidden */
  whatsappNumber: string;
  whatsappMessage: string;
  /** Meta (Facebook) Pixel ID. Empty = pixel not loaded */
  metaPixelId: string;
  /** Google Analytics 4 measurement ID, e.g. G-XXXXXXX. Empty = not loaded */
  ga4Id: string;
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  freeShippingThreshold: 999,
  shippingFee: 79,
  whatsappNumber: "",
  whatsappMessage: "Hi! I have a question about",
  metaPixelId: "",
  ga4Id: "",
  coupons: [],
};

function num(v: unknown, fallback: number): number {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && Number.isFinite(n) && n >= 0 ? n : fallback;
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v.trim() : fallback;
}

function cleanCoupons(v: unknown): Coupon[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
    .map((c) => ({
      code: String(c.code ?? "").trim().toUpperCase(),
      type: c.type === "flat" ? ("flat" as const) : ("percent" as const),
      value: num(c.value, 0),
      minOrder: num(c.minOrder, 0),
      active: c.active !== false,
    }))
    .filter((c) => c.code && c.value > 0);
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const raw = await getSetting("store_settings");
  if (!raw) return DEFAULT_STORE_SETTINGS;
  let saved: Partial<StoreSettings>;
  try {
    saved = JSON.parse(raw) as Partial<StoreSettings>;
  } catch {
    // Corrupt JSON must never break checkout.
    return DEFAULT_STORE_SETTINGS;
  }
  const d = DEFAULT_STORE_SETTINGS;
  return {
    freeShippingThreshold: num(saved.freeShippingThreshold, d.freeShippingThreshold),
    shippingFee: num(saved.shippingFee, d.shippingFee),
    // digits only — people paste "+91 98765 43210" and wa.me rejects it
    whatsappNumber: str(saved.whatsappNumber, d.whatsappNumber).replace(/\D/g, ""),
    whatsappMessage: str(saved.whatsappMessage, d.whatsappMessage),
    metaPixelId: str(saved.metaPixelId, d.metaPixelId),
    ga4Id: str(saved.ga4Id, d.ga4Id),
    coupons: cleanCoupons(saved.coupons),
  };
}
