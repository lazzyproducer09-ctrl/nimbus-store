"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ConfirmDialog } from "./ConfirmDialog";

// Lets a customer request cancellation of a confirmed (paid/shipped) order.
export function CancelOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  async function cancel() {
    await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
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
        message="This order will be cancelled, and any payment will be refunded within 5–7 business days."
        confirmLabel="Cancel order"
        onConfirm={cancel}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
