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
        <p className="text-xs text-muted">Full name</p>
        {editing ? (
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 w-56 rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-storm"
            />
            <button
              onClick={save}
              disabled={saving}
              className="h-10 rounded-full bg-storm px-4 text-sm font-medium text-white hover:bg-storm-dark disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setName(initialName);
                setError(null);
              }}
              className="h-10 rounded-full border border-ink/15 px-4 text-sm font-medium hover:border-ink/40"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="mt-0.5 flex items-center gap-3">
            <p className="text-lg font-medium">{initialName || "Not set"}</p>
            <button
              onClick={() => setEditing(true)}
              className="text-xs font-medium text-storm hover:underline"
            >
              Edit
            </button>
          </div>
        )}
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {/* Email */}
      <div>
        <p className="text-xs text-muted">Email</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <p className="font-medium">{email}</p>
          {verified && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
              ✓ Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
