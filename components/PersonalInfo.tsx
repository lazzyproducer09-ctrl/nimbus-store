"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function PersonalInfo({
  initialName,
  email,
  verified,
}: {
  initialName: string;
  email: string;
  verified: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (name.trim().length < 2) {
      setError("Please enter your name.");
      return;
    }
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Name */}
      <div>
        <p className="text-xs text-ash">Full name</p>
        {editing ? (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-56 rounded-lg border border-edge bg-coal px-3 text-sm outline-none focus:border-volt"
            />
            <button
              onClick={save}
              disabled={saving}
              className="h-10 rounded-full bg-volt px-4 text-sm font-medium text-void hover:bg-volt-dim disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setName(initialName);
                setError(null);
              }}
              className="h-10 rounded-full border border-edge px-4 text-sm font-medium hover:border-edge"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="mt-0.5 flex items-center gap-3">
            <p className="text-lg font-medium">{initialName || "Not set"}</p>
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-medium text-volt hover:underline"
            >
              Edit
            </button>
          </div>
        )}
        {error && <p className="mt-1 text-sm text-bad">{error}</p>}
      </div>

      {/* Email */}
      <div>
        <p className="text-xs text-ash">Email</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <p className="font-medium">{email}</p>
          {verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-good-deep px-2.5 py-0.5 text-xs font-medium text-good">
              ✓ Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
