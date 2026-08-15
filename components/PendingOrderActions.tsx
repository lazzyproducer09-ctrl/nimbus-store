"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "./ConfirmDialog";

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as unknown as { Razorpay?: unknown }).Razorpay) {
      return resolve(true);
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export function PendingOrderActions({
  orderId,
  razorpayOrderId,
  amount,
  customerName,
  customerPhone,
}: {
  orderId: string;
  razorpayOrderId: string | null;
  amount: number; // in paise
  customerName: string;
  customerPhone: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  async function pay() {
    if (!razorpayOrderId) {
      setError("This order can no longer be paid — please place a new order.");
      return;
    }
    setPaying(true);
    setError(null);
    const ok = await loadRazorpay();
    if (!ok) {
      setError("Could not load the payment window.");
      setPaying(false);
      return;
    }
    const RazorpayCtor = (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay;
    const rzp = new RazorpayCtor({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount,
      currency: "INR",
      name: "YOINK",
      description: "YOINK order",
      order_id: razorpayOrderId,
      prefill: { name: customerName, contact: customerPhone },
      theme: { color: "#2a5a7c" },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        const res = await fetch("/api/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...response, orderId }),
        });
        const v = await res.json();
        if (v.success) {
          router.refresh();
        } else {
          setError("Payment could not be verified.");
          setPaying(false);
        }
      },
      modal: { ondismiss: () => setPaying(false) },
    });
    rzp.open();
  }

  async function cancel() {
    const { error } = await supabase
      .from("orders")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", orderId);
    setConfirmCancel(false);
    if (error) {
      setError("Could not cancel. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="mt-6">
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={pay}
          disabled={paying}
          className="inline-flex h-11 items-center justify-center rounded-full bg-storm px-6 text-sm font-medium text-white transition-colors hover:bg-storm-dark disabled:opacity-50"
        >
          {paying ? "Opening payment…" : "Complete payment"}
        </button>
        <button
          onClick={() => setConfirmCancel(true)}
          className="inline-flex h-11 items-center justify-center rounded-full border border-ink/15 px-6 text-sm font-medium transition-colors hover:border-red-300 hover:text-red-600"
        >
          Cancel order
        </button>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        message="This order will be cancelled. You can always place a new one."
        confirmLabel="Cancel order"
        onConfirm={cancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
}
