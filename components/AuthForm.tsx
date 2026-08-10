"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleIcon } from "./icons";

// Shared login / sign-up form. `mode` decides which action it performs.
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const supabase = createClient();
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          // Email confirmation is off → logged in immediately.
          router.push("/welcome");
          router.refresh();
        } else {
          // Email confirmation is on → send them to enter the 6-digit code.
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/account");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function signInWithGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={signInWithGoogle}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-line bg-white text-sm font-medium transition-colors hover:border-ink/40"
      >
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </button>

      <div className="flex items-center gap-3 text-xs text-muted">
        <div className="h-px flex-1 bg-line" />
        or
        <div className="h-px flex-1 bg-line" />
      </div>

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
          className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-storm"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="text-sm font-medium">Password</label>
          {!isSignup && (
            <a href="/forgot-password" className="text-xs font-medium text-storm hover:underline">
              Forgot password?
            </a>
          )}
        </div>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          className="mt-1.5 h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-storm"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {message && (
        <p className="rounded-lg bg-storm-tint px-4 py-3 text-sm text-storm">{message}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="h-11 w-full rounded-full bg-storm text-sm font-medium text-white transition-all hover:bg-storm-dark disabled:opacity-50"
      >
        {loading ? "Please wait…" : isSignup ? "Create account" : "Log in"}
      </button>
      </form>
    </div>
  );
}
