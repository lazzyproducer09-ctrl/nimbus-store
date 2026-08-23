"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Address } from "@/lib/addresses";
import { ConfirmDialog } from "./ConfirmDialog";
import { AddressForm } from "./AddressForm";

export function AddressManager({
  userId,
  initialAddresses,
}: {
  userId: string;
  initialAddresses: Address[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(a: Address) {
    setEditing(a);
    setShowForm(true);
  }

  async function remove(id: string) {
    await supabase.from("addresses").delete().eq("id", id);
    setPendingDelete(null);
    router.refresh();
  }

  async function makeDefault(id: string) {
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    router.refresh();
  }

  return (
    <div>
      {/* saved address cards */}
      {initialAddresses.length > 0 && (
        <div className="space-y-3">
          {initialAddresses.map((a) => (
            <div
              key={a.id}
              className="flex items-start justify-between gap-4 rounded-xl border border-edge p-4"
            >
              <div className="text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{a.full_name}</span>
                  {a.is_default && (
                    <span className="rounded-full bg-volt-deep px-2 py-0.5 text-[11px] font-medium text-volt">
                      Default
                    </span>
                  )}
                </div>
                <p className="mt-1 text-ash">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pincode}
                </p>
                <p className="mt-0.5 text-ash">Phone: {a.phone}</p>
              </div>
              <div className="flex flex-shrink-0 flex-col items-end gap-1 text-xs">
                {!a.is_default && (
                  <button onClick={() => makeDefault(a.id)} className="text-volt hover:underline">
                    Set default
                  </button>
                )}
                <button onClick={() => openEdit(a)} className="text-ash hover:text-chalk">
                  Edit
                </button>
                <button
                  onClick={() => setPendingDelete(a.id)}
                  className="text-ash hover:text-bad"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm ? (
        <div className="mt-4">
          <AddressForm
            userId={userId}
            existing={editing}
            defaultChecked={initialAddresses.length === 0 && !editing}
            onDone={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        </div>
      ) : (
        <button
          onClick={openAdd}
          className="mt-4 h-10 rounded-full border border-edge px-5 text-sm font-medium transition-colors hover:border-edge"
        >
          + Add a new address
        </button>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete address?"
        message="This address will be permanently removed from your account."
        confirmLabel="Delete"
        onConfirm={() => pendingDelete && remove(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
