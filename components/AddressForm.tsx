"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Address } from "@/lib/addresses";

// A labelled field: the label stays visible above the input while you type.
function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string | null;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-red-500">{hint}</p>}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none transition-colors focus:border-storm placeholder:text-muted/60";

// A single, validated address form. Used on the account page AND at checkout.
export function AddressForm({
  userId,
  existing = null,
  defaultChecked = false,
  onDone,
}: {
  userId: string;
  existing?: Address | null;
  defaultChecked?: boolean;
  onDone: () => void;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    full_name: existing?.full_name ?? "",
    phone: existing?.phone ?? "",
    line1: existing?.line1 ?? "",
    line2: existing?.line2 ?? "",
    city: existing?.city ?? "",
    state: existing?.state ?? "",
    pincode: existing?.pincode ?? "",
    is_default: existing?.is_default ?? defaultChecked,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Little "Numbers only" hints for the digit-only fields.
  const [phoneHint, setPhoneHint] = useState<string | null>(null);
  const [pincodeHint, setPincodeHint] = useState<string | null>(null);

  const set = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const digitsOnly = (v: string, max: number) => v.replace(/\D/g, "").slice(0, max);

  function onPhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    set("phone", digitsOnly(raw, 10));
    setPhoneHint(/\D/.test(raw) ? "Numbers only" : null);
  }
  function onPincodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    set("pincode", digitsOnly(raw, 6));
    setPincodeHint(/\D/.test(raw) ? "Numbers only" : null);
  }

  function validate(): string | null {
    const hasDigit = (s: string) => /\d/.test(s);
    if (form.full_name.trim().length < 2 || hasDigit(form.full_name))
      return "Please enter a valid full name.";
    if (!/^[6-9]\d{9}$/.test(form.phone))
      return "Enter a valid 10-digit mobile number (starting 6–9).";
    if (form.line1.trim().length < 4)
      return "Please enter your house no. and street.";
    if (form.city.trim().length < 2 || hasDigit(form.city))
      return "Please enter a valid city.";
    if (form.state.trim().length < 2 || hasDigit(form.state))
      return "Please enter a valid state.";
    if (!/^\d{6}$/.test(form.pincode)) return "Enter a valid 6-digit pincode.";
    return null;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (form.is_default) {
        await supabase.from("addresses").update({ is_default: false }).eq("user_id", userId);
      }
      const payload = {
        full_name: form.full_name.trim(),
        phone: form.phone,
        line1: form.line1.trim(),
        line2: form.line2.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode,
        is_default: form.is_default,
        user_id: userId,
      };
      if (existing) {
        const { error } = await supabase.from("addresses").update(payload).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("addresses").insert(payload);
        if (error) throw error;
      }
      router.refresh();
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save address.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-3 rounded-xl border border-line p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Full name">
          <input
            required
            placeholder="e.g. Riya Verma"
            value={form.full_name}
            onChange={(e) => set("full_name", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Phone number" hint={phoneHint}>
          <input
            required
            inputMode="numeric"
            placeholder="10-digit mobile"
            value={form.phone}
            onChange={onPhoneChange}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Address">
        <input
          required
          placeholder="House no., building, street"
          value={form.line1}
          onChange={(e) => set("line1", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Area / landmark (optional)">
        <input
          placeholder="Area, landmark"
          value={form.line2}
          onChange={(e) => set("line2", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="City">
          <input
            required
            placeholder="e.g. Mumbai"
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="State">
          <input
            required
            placeholder="e.g. Maharashtra"
            value={form.state}
            onChange={(e) => set("state", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Pincode" hint={pincodeHint}>
          <input
            required
            inputMode="numeric"
            placeholder="6 digits"
            value={form.pincode}
            onChange={onPincodeChange}
            className={inputClass}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={form.is_default}
          onChange={(e) => set("is_default", e.target.checked)}
        />
        Set as default delivery address
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="h-10 rounded-full bg-storm px-5 text-sm font-medium text-white transition-colors hover:bg-storm-dark disabled:opacity-50"
        >
          {saving ? "Saving…" : existing ? "Save changes" : "Save address"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-10 rounded-full border border-ink/15 px-5 text-sm font-medium transition-colors hover:border-ink/40"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
