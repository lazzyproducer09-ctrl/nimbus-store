"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Shown once after the first login: asks the customer's name, then sends them to the shop.
export function WelcomeForm({ defaultName }: { defaultName: string }) {
  const router = useRouter();
  const [name, setName] = useState(defaultName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name.trim(), onboarded: true },
    });
    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }
    // Off to the shop!
    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={save} className="mt-8 space-y-4 text-left">
      <div>
        <label htmlFor="name" className="text-sm font-medium">Your name</label>
        <input
          id="name"
          type="text"
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sahil Sharma"
          className="mt-1.5 h-11 w-full rounded-lg border border-edge bg-coal px-3 text-sm outline-none focus:border-volt"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="h-11 w-full rounded-full bg-volt text-sm font-medium text-void transition-colors hover:bg-volt-dim disabled:opacity-50"
      >
        {saving ? "Saving…" : "Continue to shop"}
      </button>
    </form>
  );
}
