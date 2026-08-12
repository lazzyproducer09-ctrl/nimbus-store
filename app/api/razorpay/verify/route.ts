import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

// Verifies the Razorpay payment signature, then marks the order paid.
// The signature can only be produced with our secret key, so a fake
// "payment success" from the browser can never pass this check.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ success: false, error: "Please log in." }, { status: 401 });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId,
  } = await request.json();

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    return NextResponse.json(
      { success: false, error: "Payment could not be verified." },
      { status: 400 },
    );
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "paid", razorpay_payment_id, paid_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("user_id", user.id);
  if (error) {
    console.error("Order update failed:", error.message);
    return NextResponse.json({ success: false, error: "Could not finalise order." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
