"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Shown on the account page until the customer has verified their email
// with OUR OWN 6-digit code — separate from Google's own verification.
export function AccountVerifyBanner({
  email,
  verified,
}: {
  email: string;
  verified: boolean;
}) {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justVerified, setJustVerified] = useState(false);

  if (verified && !justVerified) return null;

  // Success state: shown for a moment right after verifying, before the
  // page refreshes and this banner disappears for good.
  if (justVerified) {
    return (
      <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5">
        <p className="text-sm font-medium text-green-800">
          ✅ Email verified successfully!
        </p>
        <p className="mt-0.5 text-xs text-green-700">
          Your account is now fully secured.
        </p>
      </div>
    );
  }

  async function sendCode() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
    if (verifyError) {
      setError("That code didn't work — check it and try again.");
      setLoading(false);
      return;
    }
    await supabase.auth.updateUser({ data: { otp_verified: true } });
    setLoading(false);
    setJustVerified(true);
    // Give the customer a moment to see the success message, then refresh
    // the page data so the badge appears and this banner goes away.
    setTimeout(() => router.refresh(), 1800);
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-amber-800">
            ⚠️ Email verification pending
          </p>
          <p className="mt-0.5 text-xs text-amber-700">
            Verify your email with a one-time code to fully secure your account.
          </p>
        </div>
        {!sent && (
          <button
            onClick={sendCode}
            disabled={loading}
            className="h-9 flex-shrink-0 rounded-full bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? "Sending…" : "Verify now"}
          </button>
        )}
      </div>

      {sent && (
        <form onSubmit={verify} className="mt-4 flex flex-wrap items-center gap-2">
          <input
            autoFocus
            required
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="6-digit code"
            className="h-10 w-36 rounded-lg border border-amber-300 bg-white px-3 text-center text-sm tracking-widest outline-none focus:border-amber-600"
          />
          <button
            type="submit"
            disabled={loading || code.length !== 6}
            className="h-10 rounded-full bg-amber-600 px-4 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
          >
            {loading ? "Verifying…" : "Confirm code"}
          </button>
          <button
            type="button"
            onClick={sendCode}
            className="text-sm font-medium text-amber-700 hover:underline"
          >
            Resend
          </button>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
