"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "./icons";

// Sign in / sign up — Google only. Supabase creates the account automatically
// on a shopper's first Google sign-in, so login and signup are the same
// action; there's nothing left for `mode` to change here.
export function AuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setError(null);
    setLoading(true);
    const supabase = createClient();
    // On success this redirects the browser away, so `loading` only ever
    // gets reset here if something fails before that redirect happens.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-edge bg-coal text-sm font-medium text-chalk transition-colors hover:border-volt/50 hover:text-volt disabled:opacity-50"
      >
        <GoogleIcon className="h-4 w-4" />
        {loading ? "Opening Google…" : "Continue with Google"}
      </button>

      {error && <p className="rounded-lg bg-bad-deep px-4 py-3 text-sm text-bad">{error}</p>}
    </div>
  );
}
