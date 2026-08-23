"use client";

import { createContext, useContext } from "react";

// ---------------------------------------------------------------------------
// The handful of store settings that are safe in the browser.
//
// Deliberately NOT the whole StoreSettings object: that carries the coupon
// list, and shipping it to every page would put every discount code in the
// page source. Only the numbers the cart has to display live here.
//
// Provided from the root layout so any client component — the cart page, the
// cart drawer — can read them without prop-drilling through `children`.
// ---------------------------------------------------------------------------

export type PublicStoreSettings = {
  freeShippingThreshold: number;
  shippingFee: number;
};

const FALLBACK: PublicStoreSettings = { freeShippingThreshold: 999, shippingFee: 79 };

const Ctx = createContext<PublicStoreSettings>(FALLBACK);

export function StoreSettingsProvider({
  value,
  children,
}: {
  value: PublicStoreSettings;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStoreSettings() {
  return useContext(Ctx);
}
