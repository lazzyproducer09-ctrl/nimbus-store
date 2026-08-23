import { NextResponse } from "next/server";
import { getStoreSettings, applyCoupon } from "@/lib/store-settings";

/**
 * Check a discount code and return what it would take off.
 *
 * This exists so the coupon LIST never reaches the browser. Shipping the whole
 * settings object to the checkout page would let anyone read every code in the
 * page source, including ones meant for a single campaign.
 *
 * The answer here is only a preview for the summary panel — the create-order
 * route re-validates the code against its own subtotal before charging, so a
 * forged response from this endpoint buys nothing.
 */
export async function POST(request: Request) {
  let code = "";
  let subtotal = 0;
  try {
    const body = await request.json();
    code = typeof body.code === "string" ? body.code : "";
    subtotal = typeof body.subtotal === "number" ? body.subtotal : 0;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request." }, { status: 400 });
  }

  const settings = await getStoreSettings();
  const result = applyCoupon(code, subtotal, settings);

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 200 });
  }
  return NextResponse.json({
    ok: true,
    code: result.coupon.code,
    discount: result.discount,
  });
}
