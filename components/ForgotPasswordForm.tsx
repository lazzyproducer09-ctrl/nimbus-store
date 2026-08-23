"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    // Recovery links from Supabase carry the session in the URL — send the
    // customer straight to /reset-password, which reads it on load.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <p className="rounded-lg bg-volt-deep px-4 py-3 text-sm text-volt">
        📧 Reset link sent! Check your email (and spam folder), then click the
        link to set a new password.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="mt-1.5 h-11 w-full rounded-lg border border-edge bg-coal px-3 text-sm outline-none focus:border-volt"
        />
      </div>
      {error && (
        <p className="rounded-lg bg-bad-deep px-4 py-3 text-sm text-bad">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-full bg-volt text-sm font-medium text-void transition-all hover:bg-volt-dim disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
