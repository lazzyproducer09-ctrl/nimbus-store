"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "./ConfirmDialog";

// Lets a customer REQUEST cancellation of a confirmed (paid/shipped) order.
// The request goes to a "pending review" state; an admin approves it to cancel.
export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);

  async function requestCancel() {
    setSending(true);
    await supabase.from("orders").update({ status: "cancel_requested" }).eq("id", orderId);
    setSending(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-red-600 hover:underline"
      >
        Request cancellation
      </button>
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
