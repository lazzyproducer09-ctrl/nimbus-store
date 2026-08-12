"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/lib/orders";
import { inr } from "@/lib/format";
import { UmbrellaMark } from "./icons";
import { ConfirmDialog } from "./ConfirmDialog";

const STATUS: Record<string, { label: string; cls: string; dot: string }> = {
  created: { label: "Payment pending", cls: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  paid: { label: "Confirmed", cls: "bg-green-100 text-green-700", dot: "bg-green-500" },
  shipped: { label: "Shipped", cls: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
  delivered: { label: "Delivered", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
  cancel_requested: { label: "Cancellation requested", cls: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700", dot: "bg-red-500" },
  return_requested: { label: "Return requested", cls: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  returned: { label: "Returned", cls: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
};
// Statuses the admin can set manually (request states are customer-driven).
const STATUS_KEYS = ["created", "paid", "shipped", "delivered", "cancelled"];

const fmtDateTime = (t: string) =>
  new Date(t).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export function OrderAdmin({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [updating, setUpdating] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);
  // when the admin is typing a decline reason for a specific order
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function write(o: Order, payload: Record<string, unknown>) {
    setUpdating(o.id);
    await supabase.from("orders").update(payload).eq("id", o.id);
    setUpdating(null);
    router.refresh();
  }

  async function updateStatus(o: Order, status: string) {
    const payload: Record<string, unknown> = { status };
    const now = new Date().toISOString();
    if (status === "cancelled") payload.cancelled_at = now;
    if (status === "paid" && !o.paid_at) payload.paid_at = now;
    await write(o, payload);
  }

  // Approve a cancellation → cancelled; approve a return → returned.
  async function approve(o: Order) {
    const now = new Date().toISOString();
    if (o.status === "return_requested") {
      await write(o, { status: "returned", returned_at: now });
    } else {
      await write(o, { status: "cancelled", cancelled_at: now });
    }
  }

  // Decline a request → restore the order and record the reason.
  async function decline(o: Order) {
    const isReturn = o.status === "return_requested";
    const restore = o.prev_status ?? (isReturn ? "delivered" : "paid");
    await write(o, {
      status: restore,
      rejected_at: new Date().toISOString(),
      reject_reason:
        reason.trim() ||
        (isReturn
          ? "This order isn’t eligible for a return."
          : "This order can no longer be cancelled."),
    });
    setRejectingId(null);
    setReason("");
  }

  async function remove(o: Order) {
    await supabase.from("orders").delete().eq("id", o.id);
    setPendingDelete(null);
    router.refresh();
  }

  if (initialOrders.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted">
        No orders yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {initialOrders.map((o) => {
        const s = STATUS[o.status] ?? { label: o.status, cls: "bg-mist text-muted", dot: "bg-muted" };
        const itemCount = o.items.reduce((n, it) => n + it.quantity, 0);
        const isRequest = o.status === "cancel_requested" || o.status === "return_requested";
        const isReturn = o.status === "return_requested";
        return (
          <div
            key={o.id}
            className={`overflow-hidden rounded-2xl border bg-white ${
              isRequest ? "border-orange-300 ring-1 ring-orange-200" : "border-line"
            }`}
          >
            {/* top bar — status, id, prominent date/time, total */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper/40 px-5 py-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
                <span className="font-mono text-xs text-ink">#{o.id.slice(0, 8).toUpperCase()}</span>
                <span className="text-xs font-medium text-ink">
                  🗓 {fmtDateTime(o.created_at)}
                </span>
              </div>
              <span className="text-lg font-semibold">{inr(o.total)}</span>
            </div>

            {/* body */}
            <div className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="text-sm">
                  <p className="font-medium">{o.address?.full_name}</p>
                  <p className="text-muted">{o.address?.phone}</p>
                  <p className="mt-1 max-w-md text-xs text-muted">
                    {o.address?.line1}
                    {o.address?.line2 ? `, ${o.address.line2}` : ""}, {o.address?.city},{" "}
                    {o.address?.state} {o.address?.pincode}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-muted">
                  {itemCount} item{itemCount === 1 ? "" : "s"}
                </span>
              </div>

              {/* lifecycle timeline */}
              {(o.paid_at ||
                o.cancel_requested_at ||
                o.cancelled_at ||
                o.return_requested_at ||
                o.returned_at ||
                o.rejected_at) && (
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 rounded-lg bg-mist/40 px-3 py-2 text-[11px] text-muted">
                  {o.paid_at && <span>✓ Confirmed: <b className="text-ink">{fmtDateTime(o.paid_at)}</b></span>}
                  {o.cancel_requested_at && <span>Cancel req: <b className="text-ink">{fmtDateTime(o.cancel_requested_at)}</b></span>}
                  {o.cancelled_at && <span>Cancelled: <b className="text-ink">{fmtDateTime(o.cancelled_at)}</b></span>}
                  {o.return_requested_at && <span>Return req: <b className="text-ink">{fmtDateTime(o.return_requested_at)}</b></span>}
                  {o.returned_at && <span>Returned: <b className="text-ink">{fmtDateTime(o.returned_at)}</b></span>}
                  {o.rejected_at && <span>Declined: <b className="text-ink">{fmtDateTime(o.rejected_at)}</b></span>}
                </div>
              )}

              {/* items */}
              <div className="mt-3 flex flex-wrap gap-2">
                {o.items.map((it, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-line bg-mist/40 py-1 pl-1 pr-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-md bg-mist text-storm/40">
                      {it.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.image} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <UmbrellaMark className="h-4 w-4" />
                      )}
                    </div>
                    <span className="text-xs">
                      {it.name}
                      {it.size ? ` · ${it.size}` : ""} ×{it.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* cancellation / return request → approve / decline */}
            {isRequest && (
              <div className="border-t border-orange-200 bg-orange-50 px-5 py-3">
                <p className="text-sm font-medium text-orange-800">
                  ⚠️ Customer requested {isReturn ? "a return" : "cancellation"} — please review.
                </p>
                {isReturn && o.return_reason && (
                  <p className="mt-1 text-xs text-orange-700">
                    Reason: &ldquo;{o.return_reason}&rdquo;
                  </p>
                )}

                {rejectingId === o.id ? (
                  <div className="mt-3">
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      placeholder={
                        isReturn
                          ? "Reason for declining the return (shown to the customer)…"
                          : "Reason for declining, e.g. order already shipped (shown to the customer)…"
                      }
                      className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm outline-none focus:border-orange-400"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => decline(o)}
                        disabled={updating === o.id}
                        className="h-9 rounded-full bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                      >
                        Confirm decline
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setReason("");
                        }}
                        className="h-9 rounded-full border border-ink/15 px-4 text-sm font-medium transition-colors hover:border-ink/40"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => approve(o)}
                      disabled={updating === o.id}
                      className="h-9 rounded-full bg-green-600 px-4 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                    >
                      {isReturn ? "Approve return" : "Approve & cancel"}
                    </button>
                    <button
                      onClick={() => {
                        setRejectingId(o.id);
                        setReason("");
                      }}
                      disabled={updating === o.id}
                      className="h-9 rounded-full border border-ink/15 px-4 text-sm font-medium transition-colors hover:border-ink/40 disabled:opacity-50"
                    >
                      Decline
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Update status</span>
                <select
                  value={STATUS_KEYS.includes(o.status) ? o.status : ""}
                  onChange={(e) => updateStatus(o, e.target.value)}
                  disabled={updating === o.id}
                  className="h-9 rounded-lg border border-line bg-white px-2 text-sm outline-none focus:border-storm disabled:opacity-50"
                >
                  {!STATUS_KEYS.includes(o.status) && (
                    <option value="" disabled>
                      {STATUS[o.status]?.label ?? o.status}
                    </option>
                  )}
                  {STATUS_KEYS.map((k) => (
                    <option key={k} value={k}>{STATUS[k].label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setPendingDelete(o)}
                className="text-xs font-medium text-muted transition-colors hover:text-red-600"
              >
                Delete order
              </button>
            </div>
          </div>
        );
      })}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete order?"
        message={`Permanently delete this order (${inr(pendingDelete?.total ?? 0)})? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => pendingDelete && remove(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
