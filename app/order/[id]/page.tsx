import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { getSettings } from "@/lib/settings";
import { inr } from "@/lib/format";
import { PendingOrderActions } from "@/components/PendingOrderActions";
import { CancelOrderButton } from "@/components/CancelOrderButton";
import { RequestReturnButton } from "@/components/RequestReturnButton";
import { OrderConfirmedCheck } from "@/components/OrderConfirmedCheck";
import type { ChimeType } from "@/lib/chime";

export const metadata: Metadata = { title: "Order — NIMBUS" };

const HEAD: Record<string, { icon: string; bg: string; title: string; sub: string }> = {
  paid: {
    icon: "✓",
    bg: "bg-green-100 text-green-600",
    title: "Order confirmed",
    sub: "Payment received. We’re preparing your order for dispatch.",
  },
  shipped: {
    icon: "🚚",
    bg: "bg-blue-100 text-blue-600",
    title: "Order shipped",
    sub: "Your order has been dispatched and is on its way.",
  },
  delivered: {
    icon: "✓",
    bg: "bg-emerald-100 text-emerald-600",
    title: "Order delivered",
    sub: "Delivered. If something isn’t right, you can request a return within 7 days.",
  },
  created: {
    icon: "⏳",
    bg: "bg-amber-100 text-amber-600",
    title: "Payment pending",
    sub: "Complete your payment below to confirm this order.",
  },
  cancel_requested: {
    icon: "⏳",
    bg: "bg-amber-100 text-amber-600",
    title: "Cancellation under review",
    sub: "Your request is being reviewed. We’ll update this page once it’s processed.",
  },
  cancelled: {
    icon: "✕",
    bg: "bg-red-100 text-red-600",
    title: "Order cancelled",
    sub: "This order has been cancelled.",
  },
  return_requested: {
    icon: "⏳",
    bg: "bg-amber-100 text-amber-600",
    title: "Return under review",
    sub: "Your return request is being reviewed. We’ll update this page once it’s processed.",
  },
  returned: {
    icon: "↩",
    bg: "bg-emerald-100 text-emerald-600",
    title: "Return complete",
    sub: "Your return has been processed.",
  },
};

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Load the order and the (admin-controlled) sound settings in parallel.
  const [order, settings] = await Promise.all([
    getOrderById(id),
    getSettings(["sound_enabled", "sound_volume", "sound_type"]),
  ]);
  if (!order) notFound();

  const h = HEAD[order.status] ?? HEAD.created;
  const isPending = order.status === "created";
  const a = order.address;

  const soundOn = settings["sound_enabled"] !== "false"; // default ON
  const soundVolumeRaw = parseFloat(settings["sound_volume"] ?? "0.5");
  const soundVolume = isNaN(soundVolumeRaw) ? 0.5 : soundVolumeRaw;
  const soundType = (settings["sound_type"] ?? "chime") as ChimeType;

  const isCancelFlow = order.status === "cancelled" || order.status === "cancel_requested";
  const isReturnFlow = order.status === "returned" || order.status === "return_requested";
  // A request was declined and the order returned to its earlier state.
  const wasRejected =
    !!order.rejected_at &&
    (order.status === "paid" || order.status === "shipped" || order.status === "delivered");

  // Nicely formatted date + time for the order timeline.
  const fmt = (t: string | null) =>
    t
      ? new Date(t).toLocaleString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;
  // Estimated refund date = 7 days after the order was cancelled / returned.
  const settledAt = order.cancelled_at ?? order.returned_at;
  const refundBy = settledAt
    ? fmt(new Date(new Date(settledAt).getTime() + 7 * 864e5).toISOString())
    : null;

  // Unified values so one tracker works for both cancellation and return.
  const inFlow = isCancelFlow || isReturnFlow;
  const flowLabel = isReturnFlow ? "Return" : "Cancellation";
  const requestedAt = isReturnFlow ? order.return_requested_at : order.cancel_requested_at;
  const isSettled = isReturnFlow ? order.status === "returned" : order.status === "cancelled";
  const settledLabel = isReturnFlow ? "Return approved" : "Approved & cancelled";

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-12">
      <div className="rounded-2xl border border-line bg-white p-8 text-center">
        {order.status === "paid" ? (
          <OrderConfirmedCheck soundEnabled={soundOn} volume={soundVolume} soundType={soundType} />
        ) : (
          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${h.bg}`}>
            {h.icon}
          </div>
        )}
        <h1 className="mt-4 font-heading text-2xl font-semibold tracking-tight">{h.title}</h1>
        <p className="mt-2 text-sm text-muted">{h.sub}</p>
        <p className="mt-3 text-xs text-muted">
          Order ID: <span className="font-mono text-ink">{order.id.slice(0, 8).toUpperCase()}</span>
        </p>
        {order.paid_at && (
          <p className="mt-1 text-xs text-muted">Confirmed on {fmt(order.paid_at)}</p>
        )}

        {/* a request was declined by the store */}
        {wasRejected && (
          <div className="mx-auto mt-5 max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-left">
            <p className="text-sm font-semibold text-red-800">
              Your request was declined
            </p>
            <p className="mt-1 text-xs text-red-700">
              {order.reject_reason
                ? order.reject_reason
                : "This order can no longer be cancelled or returned."}
            </p>
          </div>
        )}

        {/* refund tracker — works for both cancellation and return */}
        {inFlow && (
          <div className="mx-auto mt-5 max-w-md rounded-xl border border-line bg-paper/60 p-5 text-left">
            <p className="text-sm font-semibold text-ink">{flowLabel} &amp; refund</p>
            <ol className="mt-3 space-y-3">
              <li className="flex gap-3">
                <span className="mt-0.5 text-green-600">✓</span>
                <span className="text-xs">
                  <span className="font-medium text-ink">{flowLabel} requested</span>
                  {requestedAt && (
                    <span className="mt-0.5 block text-muted">{fmt(requestedAt)}</span>
                  )}
                </span>
              </li>

              <li className="flex gap-3">
                <span className={`mt-0.5 ${isSettled ? "text-green-600" : "text-amber-500"}`}>
                  {isSettled ? "✓" : "⏳"}
                </span>
                <span className="text-xs">
                  <span className="font-medium text-ink">
                    {isSettled ? settledLabel : "Under review by our team"}
                  </span>
                  {settledAt && (
                    <span className="mt-0.5 block text-muted">{fmt(settledAt)}</span>
                  )}
                </span>
              </li>

              <li className="flex gap-3">
                <span className={`mt-0.5 ${isSettled ? "text-storm" : "text-muted"}`}>💳</span>
                <span className="text-xs">
                  <span className="font-medium text-ink">Refund</span>
                  <span className="mt-0.5 block text-muted">
                    {isSettled
                      ? refundBy
                        ? `Online payments are refunded to the original method by around ${refundBy}. Cash-on-delivery orders have nothing to refund.`
                        : "Online payments are refunded within 5–7 business days. Cash-on-delivery orders have nothing to refund."
                      : `Refund begins once your ${flowLabel.toLowerCase()} is approved. Cash-on-delivery orders have nothing to refund.`}
                  </span>
                </span>
              </li>
            </ol>
          </div>
        )}

        {isPending && (
          <PendingOrderActions
            orderId={order.id}
            razorpayOrderId={order.razorpay_order_id}
            amount={order.total * 100}
            customerName={a.full_name}
            customerPhone={a.phone}
          />
        )}

        {/* cancel (before delivery) or return (after delivery) */}
        {(order.status === "paid" || order.status === "shipped") && (
          <div className="mt-5">
            <CancelOrderButton orderId={order.id} currentStatus={order.status} />
          </div>
        )}
        {order.status === "delivered" && (
          <div className="mt-5">
            <RequestReturnButton orderId={order.id} />
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
