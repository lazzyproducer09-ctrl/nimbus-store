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
};
// Statuses the admin can set manually from the dropdown (cancel_requested is
// customer-driven, so it's shown but not manually selectable).
const STATUS_KEYS = ["created", "paid", "shipped", "delivered", "cancelled"];

export function OrderAdmin({ initialOrders }: { initialOrders: Order[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [updating, setUpdating] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Order | null>(null);

  async function updateStatus(id: string, status: string) {
    setUpdating(id);
    await supabase.from("orders").update({ status }).eq("id", id);
    setUpdating(null);
    router.refresh();
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
        const cancelReq = o.status === "cancel_requested";
        return (
          <div
            key={o.id}
            className={`overflow-hidden rounded-2xl border bg-white ${
              cancelReq ? "border-orange-300 ring-1 ring-orange-200" : "border-line"
            }`}
          >
            {/* top bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-paper/40 px-5 py-3">
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${s.cls}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                  {s.label}
                </span>
                <span className="text-xs text-muted">
                  #{o.id.slice(0, 8).toUpperCase()} ·{" "}
                  {new Date(o.created_at).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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

            {/* cancellation request banner + approve/reject */}
            {cancelReq && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-orange-200 bg-orange-50 px-5 py-3">
                <span className="text-sm font-medium text-orange-800">
                  ⚠️ Customer requested cancellation — review this order.
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(o.id, "cancelled")}
                    disabled={updating === o.id}
                    className="h-9 rounded-full bg-red-600 px-4 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                  >
                    Approve &amp; cancel
                  </button>
                  <button
                    onClick={() => updateStatus(o.id, "paid")}
                    disabled={updating === o.id}
                    className="h-9 rounded-full border border-ink/15 px-4 text-sm font-medium transition-colors hover:border-ink/40 disabled:opacity-50"
                  >
                    Reject (keep order)
                  </button>
                </div>
              </div>
            )}

            {/* actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted">Update status</span>
                <select
                  value={STATUS_KEYS.includes(o.status) ? o.status : ""}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
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
