"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Lets a customer request a return on a DELIVERED order. Goes to a
// "return_requested" state for the admin to approve or decline.
export function RequestReturnButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSending(true);
    setError(null);
    const { error } = await supabase
      .from("orders")
      .update({
        status: "return_requested",
        prev_status: "delivered",
        return_reason: reason.trim() || null,
        return_requested_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    setSending(false);
    if (error) {
      setError("Could not submit your return. Please try again.");
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center rounded-full border border-ink/15 px-6 text-sm font-medium transition-colors hover:border-ink/40"
      >
        Return an item
      </button>
    );
  }

  return (
    <div className="mx-auto mt-2 max-w-md rounded-2xl border border-line bg-white p-5 text-left">
      <p className="text-sm font-semibold text-ink">Request a return</p>
      <p className="mt-1 text-xs text-muted">
        Tell us why you&rsquo;d like to return this order (optional). Returns are accepted
        within 7 days of delivery.
      </p>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={3}
        placeholder="e.g. Size didn't fit, received a different colour…"
        className="mt-3 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-storm"
      />
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      <div className="mt-3 flex gap-2">
        <button
          onClick={submit}
          disabled={sending}
          className="h-10 flex-1 rounded-full bg-storm text-sm font-medium text-white transition-colors hover:bg-storm-dark disabled:opacity-50"
        >
          {sending ? "Submitting…" : "Submit return request"}
        </button>
        <button
          onClick={() => setOpen(false)}
          className="h-10 rounded-full border border-ink/15 px-5 text-sm font-medium transition-colors hover:border-ink/40"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
