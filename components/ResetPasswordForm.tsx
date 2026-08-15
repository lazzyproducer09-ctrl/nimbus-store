"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean | null>(null); // null = checking

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      // Two possible link formats depending on Supabase config — handle both.
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        setReady(!error);
        return;
      }
      // Otherwise the client auto-reads the recovery session from the URL hash.
      const { data } = await supabase.auth.getSession();
      setReady(!!data.session);
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/account");
    router.refresh();
  }

  if (ready === null) {
    return <p className="text-sm text-ash">Checking your reset link…</p>;
  }

  if (!ready) {
    return (
      <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
        This reset link is invalid or has expired. Please request a new one
        from the{" "}
        <a href="/forgot-password" className="font-medium underline">
          forgot password
        </a>{" "}
        page.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">New password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="mt-1.5 h-11 w-full rounded-lg border border-edge bg-coal px-3 text-sm outline-none focus:border-volt"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Confirm new password</label>
        <input
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Re-enter password"
          className="mt-1.5 h-11 w-full rounded-lg border border-edge bg-coal px-3 text-sm outline-none focus:border-volt"
        />
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-400">{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-full bg-volt text-sm font-medium text-void transition-all hover:bg-volt-dim disabled:opacity-50"
      >
        {loading ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
