"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function VerifyEmailForm({ email }: { email: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "signup",
    });
    setLoading(false);
    if (error) {
      setError("That code didn't work — check it and try again.");
      return;
    }
    await supabase.auth.updateUser({ data: { otp_verified: true } });
    router.push("/welcome");
    router.refresh();
  }

  async function resend() {
    setError(null);
    setResent(false);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) setError(error.message);
    else setResent(true);
  }

  return (
    <form onSubmit={verify} className="space-y-4">
      <div>
        <label className="text-sm font-medium">6-digit code</label>
        <input
          autoFocus
          required
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          className="mt-1.5 h-14 w-full rounded-lg border border-line bg-white px-3 text-center text-2xl tracking-[0.4em] outline-none focus:border-storm"
        />
      </div>

      {error && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      {resent && (
        <p className="rounded-lg bg-storm-tint px-4 py-3 text-sm text-storm">
          New code sent — check your email.
        </p>
      )}

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="h-11 w-full rounded-full bg-storm text-sm font-medium text-white transition-all hover:bg-storm-dark disabled:opacity-50"
      >
        {loading ? "Verifying…" : "Verify & continue"}
      </button>

      <button
        type="button"
        onClick={resend}
        className="w-full text-center text-sm font-medium text-storm hover:underline"
      >
        Resend code
      </button>
    </form>
  );
}
