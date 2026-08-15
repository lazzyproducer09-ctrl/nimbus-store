"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "./ConfirmDialog";

// Lets a customer REQUEST cancellation of a confirmed (paid/shipped) order.
// The request goes to a "pending review" state; an admin approves it to cancel.
export function CancelOrderButton({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestCancel() {
    setSending(true);
    setError(null);
    const { error } = await supabase
      .from("orders")
      .update({
        status: "cancel_requested",
        prev_status: currentStatus,
        cancel_requested_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    setSending(false);
    if (error) {
      setError("Could not send the request. Please try again.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-ash underline-offset-4 transition-colors hover:text-red-400 hover:underline"
      >
        Request cancellation
      </button>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      <ConfirmDialog
        open={open}
        title="Request cancellation?"
        message="We’ll send this cancellation request for review. Once it’s approved, any online payment is refunded to your original method within 5–7 business days."
        confirmLabel={sending ? "Sending…" : "Send request"}
        onConfirm={requestCancel}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
