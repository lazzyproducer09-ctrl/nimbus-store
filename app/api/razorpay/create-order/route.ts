import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { razorpay } from "@/lib/razorpay";

// Creates a Razorpay order + saves a matching order row (status "created").
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please log in." }, { status: 401 });
  }

  const body = await request.json();
  const clientItems = (body.items ?? []) as Array<{
    productId: string;
    slug: string;
    name: string;
    image: string | null;
    size: string | null;
    color: string | null;
    quantity: number;
  }>;
  const address = body.address;

  if (!clientItems.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }
  if (!address) {
    return NextResponse.json({ error: "Please choose a delivery address." }, { status: 400 });
  }

  // SECURITY & FRESHNESS: never trust the browser's snapshot. Re-read the
  // price AND the photo/name/slug from the DB. A shopper's cart can be days
  // old and still carry a photo the admin has since removed — the DB is the
  // single source of truth, so a removed photo never resurfaces in an order.
  const ids = clientItems.map((i) => i.productId);
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("id, name, slug, price, images")
    .in("id", ids);
  if (prodErr || !products) {
    return NextResponse.json({ error: "Could not load products." }, { status: 500 });
  }
  const productMap = new Map(products.map((p) => [p.id, p]));

  const items = clientItems.map((i) => {
    const p = productMap.get(i.productId);
    return {
      ...i,
      // Client keeps only its own choices (size, colour, quantity). The
      // product fields below always come fresh from the catalogue.
      name: p?.name ?? i.name,
      slug: p?.slug ?? i.slug,
      price: (p?.price as number) ?? 0,
      image: p?.images?.[0] ?? null,
    };
  });
  const subtotal = items.reduce((n, i) => n + i.price * i.quantity, 0);
  const shipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal + shipping;
  if (total <= 0) {
    return NextResponse.json({ error: "Invalid order total." }, { status: 400 });
  }

  // Razorpay works in paise (₹1 = 100 paise).
  let rzpOrder;
  try {
    rzpOrder = await razorpay.orders.create({
      amount: total * 100,
      currency: "INR",
      receipt: `offbeat_${Date.now()}`,
    });
  } catch (e) {
    console.error("Razorpay order create failed:", e);
    return NextResponse.json({ error: "Payment setup failed." }, { status: 500 });
  }

  const orderFields = {
    user_id: user.id,
    status: "created",
    subtotal,
    shipping,
    total,
    items,
    address,
    razorpay_order_id: rzpOrder.id,
  };

  // Avoid piling up duplicate pending orders: if this user already has an
  // unpaid ("created") order, REUSE it (update it with this attempt) instead
  // of inserting a brand-new row every time they open the payment window.
  const { data: existing } = await supabase
    .from("orders")
    .select("id, payment_attempts")
    .eq("user_id", user.id)
    .eq("status", "created")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let orderId: string;
  if (existing) {
    const { error: updErr } = await supabase
      .from("orders")
      .update({ ...orderFields, payment_attempts: (existing.payment_attempts ?? 0) + 1 })
      .eq("id", existing.id);
    if (updErr) {
      console.error("Order update failed:", updErr.message);
      return NextResponse.json({ error: "Could not save your order." }, { status: 500 });
    }
    orderId = existing.id;
  } else {
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({ ...orderFields, payment_attempts: 1 })
      .select("id")
      .single();
    if (orderErr || !order) {
      console.error("Order insert failed:", orderErr?.message);
      return NextResponse.json({ error: "Could not save your order." }, { status: 500 });
    }
    orderId = order.id;
  }

  return NextResponse.json({
    orderId,
    razorpayOrderId: rzpOrder.id,
    amount: total * 100,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  });
}
