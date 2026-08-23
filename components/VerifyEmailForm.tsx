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
  const [verified, setVerified] = useState(false);

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
    setVerified(true);
    setTimeout(() => {
      router.push("/welcome");
      router.refresh();
    }, 1200);
  }

  async function resend() {
    setError(null);
    setResent(false);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) setError(error.message);
    else setResent(true);
  }

  if (verified) {
    return (
      <div className="rounded-lg bg-good-deep px-4 py-6 text-center">
        <p className="text-sm font-medium text-good">✅ Email verified successfully!</p>
        <p className="mt-1 text-xs text-good">Taking you to the next step…</p>
      </div>
    );
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
          className="mt-1.5 h-14 w-full rounded-lg border border-edge bg-coal px-3 text-center text-2xl tracking-[0.4em] outline-none focus:border-volt"
        />
      </div>

      {error && <p className="rounded-lg bg-bad-deep px-4 py-3 text-sm text-bad">{error}</p>}
      {resent && (
        <p className="rounded-lg bg-volt-deep px-4 py-3 text-sm text-volt">
          New code sent — check your email.
        </p>
      )}

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="h-11 w-full rounded-full bg-volt text-sm font-medium text-void transition-all hover:bg-volt-dim disabled:opacity-50"
      >
        {loading ? "Verifying…" : "Verify & continue"}
      </button>

      <button
        type="button"
        onClick={resend}
        className="w-full text-center text-sm font-medium text-volt hover:underline"
      >
        Resend code
      </button>
    </form>
  );
}
