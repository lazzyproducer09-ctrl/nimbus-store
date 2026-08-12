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
  return_approved: {
    icon: "📦",
    bg: "bg-indigo-100 text-indigo-600",
    title: "Return approved",
    sub: "Your return is approved. Please send the item back — your refund is processed once we receive it.",
  },
  returned: {
    icon: "↩",
    bg: "bg-emerald-100 text-emerald-600",
    title: "Return complete",
    sub: "We’ve received your item and your return is complete.",
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
  const isReturnFlow =
    order.status === "returned" ||
    order.status === "return_requested" ||
    order.status === "return_approved";
  // A request was declined earlier → block re-requesting the SAME thing.
  const cancelDeclined = order.reject_kind === "cancel";
  const returnDeclined = order.reject_kind === "return";

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

  // Build the tracker steps for whichever flow this order is in.
  const inFlow = isCancelFlow || isReturnFlow;
  const flowLabel = isReturnFlow ? "Return" : "Cancellation";
  // Refund only actually begins once the order is cancelled OR the item is received back.
  const refundActive = order.status === "cancelled" || order.status === "returned";
  const steps: { label: string; at: string | null; done: boolean }[] = isReturnFlow
    ? [
        { label: "Return requested", at: order.return_requested_at, done: true },
        {
          label: "Return approved",
          at: order.return_approved_at,
          done: order.status === "return_approved" || order.status === "returned",
        },
        {
          label: "Item received — return complete",
          at: order.returned_at,
          done: order.status === "returned",
        },
      ]
    : [
        { label: "Cancellation requested", at: order.cancel_requested_at, done: true },
        {
          label: "Approved & cancelled",
          at: order.cancelled_at,
          done: order.status === "cancelled",
        },
      ];
  // The first not-yet-done step is the "current" one (shows ⏳).
  const currentStepIdx = steps.findIndex((st) => !st.done);

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

        {/* refund tracker — steps differ for cancellation vs return */}
        {inFlow && (
          <div className="mx-auto mt-5 max-w-md rounded-xl border border-line bg-paper/60 p-5 text-left">
            <p className="text-sm font-semibold text-ink">{flowLabel} &amp; refund</p>
            <ol className="mt-3 space-y-3">
              {steps.map((st, i) => {
                const isCurrent = i === currentStepIdx;
                return (
                  <li key={i} className="flex gap-3">
                    <span
                      className={`mt-0.5 ${
                        st.done ? "text-green-600" : isCurrent ? "text-amber-500" : "text-muted"
                      }`}
                    >
                      {st.done ? "✓" : isCurrent ? "⏳" : "○"}
                    </span>
                    <span className="text-xs">
                      <span className={`font-medium ${st.done || isCurrent ? "text-ink" : "text-muted"}`}>
                        {isCurrent && !st.done ? `${st.label} — in progress` : st.label}
                      </span>
                      {st.at && <span className="mt-0.5 block text-muted">{fmt(st.at)}</span>}
                    </span>
                  </li>
                );
              })}

              {/* refund */}
              <li className="flex gap-3">
                <span className={`mt-0.5 ${refundActive ? "text-storm" : "text-muted"}`}>💳</span>
                <span className="text-xs">
                  <span className="font-medium text-ink">Refund</span>
                  <span className="mt-0.5 block text-muted">
                    {refundActive
                      ? refundBy
                        ? `Online payments are refunded to the original method by around ${refundBy}. Cash-on-delivery orders have nothing to refund.`
                        : "Online payments are refunded within 5–7 business days. Cash-on-delivery orders have nothing to refund."
                      : isReturnFlow
                        ? "Your refund is processed once we receive the returned item. Cash-on-delivery orders have nothing to refund."
                        : "Refund begins once your cancellation is approved. Cash-on-delivery orders have nothing to refund."}
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

        {/* cancel (before delivery): allow one request, then Talk to us */}
        {(order.status === "paid" || order.status === "shipped") && (
          <div className="mt-5">
            {cancelDeclined ? (
              <DeclinedNotice reason={order.reject_reason} kind="cancellation" />
            ) : (
              <CancelOrderButton orderId={order.id} currentStatus={order.status} />
            )}
          </div>
        )}

        {/* return (after delivery): allow one request, then Talk to us */}
        {order.status === "delivered" && (
          <div className="mt-5">
            {returnDeclined ? (
              <DeclinedNotice reason={order.reject_reason} kind="return" />
            ) : (
              <RequestReturnButton orderId={order.id} />
            )}
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

// Shown when the store has already declined a cancellation/return request —
// instead of letting the customer keep re-requesting, we point them to support.
function DeclinedNotice({
  reason,
  kind,
}: {
  reason: string | null;
  kind: "cancellation" | "return";
}) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-left">
      <p className="text-sm font-semibold text-red-800">Your {kind} request was declined</p>
      <p className="mt-1 text-xs text-red-700">
        {reason ?? `This order isn’t eligible for ${kind}.`}
      </p>
      <p className="mt-2 text-xs text-red-700">
        If you think this is a mistake, please get in touch — we’re happy to help.
      </p>
      <Link
        href="/contact"
        className="mt-3 inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-storm"
      >
        Talk to us
      </Link>
    </div>
  );
}
