import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { getSetting } from "@/lib/settings";
import { inr } from "@/lib/format";
import { PendingOrderActions } from "@/components/PendingOrderActions";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { SuccessSound } from "@/components/SuccessSound";

export const metadata: Metadata = { title: "Order — NIMBUS" };

const HEAD: Record<string, { icon: string; bg: string; title: string; sub: string }> = {
  paid: {
    icon: "✓",
    bg: "bg-green-100 text-green-600",
    title: "Order confirmed!",
    sub: "Thank you — your payment was successful and your order is being prepared.",
  },
  shipped: {
    icon: "🚚",
    bg: "bg-blue-100 text-blue-600",
    title: "Order shipped",
    sub: "Your order is on its way.",
  },
  delivered: {
    icon: "✓",
    bg: "bg-emerald-100 text-emerald-600",
    title: "Order delivered",
    sub: "Delivered — hope you love it!",
  },
  created: {
    icon: "⏳",
    bg: "bg-amber-100 text-amber-600",
    title: "Payment pending",
    sub: "Your payment isn’t complete yet. Finish it below to confirm your order.",
  },
  cancelled: {
    icon: "✕",
    bg: "bg-red-100 text-red-600",
    title: "Order cancelled",
    sub: "This order was cancelled.",
  },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const h = HEAD[order.status] ?? HEAD.created;
  const isPending = order.status === "created";
  const a = order.address;

  // Play a success chime on order confirmation, if the admin enabled sounds.
  const soundOn = (await getSetting("sound_enabled")) !== "false"; // default ON
  const soundVolume = parseFloat((await getSetting("sound_volume")) ?? "0.5");

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12">
      {order.status === "paid" && soundOn && (
        <SuccessSound enabled volume={isNaN(soundVolume) ? 0.5 : soundVolume} />
      )}
      <div className="rounded-2xl border border-line bg-white p-8 text-center">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${h.bg}`}>
          {h.icon}
        </div>
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight">{h.title}</h1>
        <p className="mt-2 text-sm text-muted">{h.sub}</p>
        <p className="mt-3 text-xs text-muted">
          Order ID: <span className="font-mono text-ink">{order.id.slice(0, 8).toUpperCase()}</span>
        </p>

        {isPending && (
          <PendingOrderActions
            orderId={order.id}
            razorpayOrderId={order.razorpay_order_id}
            amount={order.total * 100}
            customerName={a.full_name}
            customerPhone={a.phone}
          />
        )}

        {(order.status === "paid" || order.status === "shipped") && (
          <div className="mt-5">
            <CancelOrderButton orderId={order.id} />
          </div>
        )}
      </div>

      {/* Items */}
      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-heading text-lg font-semibold">Items</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((it, idx) => (
            <li key={idx} className="flex justify-between gap-2">
              <span className="text-muted">
                {it.name}
                {it.size ? ` · ${it.size}` : ""}
                {it.color ? ` · ${it.color}` : ""} × {it.quantity}
              </span>
              <span>{inr(it.price * it.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{inr(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span>{order.shipping === 0 ? "Free" : inr(order.shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
            <span>{order.status === "paid" || order.status === "shipped" || order.status === "delivered" ? "Total paid" : "Total payable"}</span>
            <span>{inr(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Delivery */}
      <div className="mt-6 rounded-2xl border border-line bg-white p-6">
        <h2 className="font-heading text-lg font-semibold">Delivering to</h2>
        <p className="mt-3 text-sm">
          <span className="font-medium">{a.full_name}</span>
          <span className="mt-1 block text-muted">
            {a.line1}
            {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
          </span>
          <span className="mt-0.5 block text-muted">Phone: {a.phone}</span>
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/shop"
          className="inline-flex h-11 items-center justify-center rounded-full bg-storm px-6 text-sm font-medium text-white transition-colors hover:bg-storm-dark"
        >
          Continue shopping
        </Link>
        <Link
          href="/orders"
          className="inline-flex h-11 items-center justify-center rounded-full border border-ink/15 px-6 text-sm font-medium transition-colors hover:border-ink/40"
        >
          View my orders
        </Link>
      </div>
    </div>
  );
}
