"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { StoreSettings, Coupon } from "@/lib/store-settings";
import { CloseIcon } from "./icons";

// ---------------------------------------------------------------------------
// Admin → Growth & operations.
//
// The knobs that change how the store BEHAVES rather than what it says:
// shipping thresholds, the WhatsApp line, ad-tracking IDs, discount codes.
// Saved as one JSON blob in site_settings, like the other managers here.
// ---------------------------------------------------------------------------

const inputClass =
  "h-10 w-full rounded-lg border border-edge bg-surface px-3 text-sm text-chalk outline-none transition-colors focus:border-volt placeholder:text-ash-dim";
const labelClass = "mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ash";

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-edge-soft pt-6 first:border-0 first:pt-0">
      <h3 className="font-heading text-sm font-semibold text-chalk">{title}</h3>
      <p className="mb-4 mt-0.5 text-xs text-ash">{hint}</p>
      {children}
    </section>
  );
}

export function StoreSettingsManager({ initial }: { initial: StoreSettings }) {
  const router = useRouter();
  const supabase = createClient();
  const [s, setS] = useState<StoreSettings>(initial);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function edit(fn: (draft: StoreSettings) => void) {
    setS((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setSaved(false);
    setError(null);
  }

  async function save() {
    // Codes are matched in upper case everywhere, so normalise before storing.
    const clean: StoreSettings = {
      ...s,
      whatsappNumber: s.whatsappNumber.replace(/\D/g, ""),
      coupons: s.coupons
        .map((c) => ({ ...c, code: c.code.trim().toUpperCase() }))
        .filter((c) => c.code && c.value > 0),
    };
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "store_settings", value: JSON.stringify(clean) });
    setSaving(false);
    if (error) setError(error.message);
    else {
      setS(clean);
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="rounded-2xl border border-edge bg-coal p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Growth &amp; operations</h2>
          <p className="mt-1 text-xs text-ash">
            Shipping rules, WhatsApp support, ad tracking and discount codes.
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex-shrink-0 rounded-full border border-edge px-4 py-2 text-sm font-medium text-chalk transition-colors hover:border-volt/50 hover:text-volt"
        >
          {open ? "Close" : "Edit"}
        </button>
      </div>

      {open && (
        <div className="mt-6 space-y-6">
          {/* ---------- shipping ---------- */}
          <Section
            title="Shipping"
            hint="Used by the cart, the checkout and the server — change it once here and every total follows."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Free shipping above (₹)</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={s.freeShippingThreshold}
                  onChange={(e) =>
                    edit((d) => void (d.freeShippingThreshold = Number(e.target.value) || 0))
                  }
                />
              </div>
              <div>
                <label className={labelClass}>Shipping fee below that (₹)</label>
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={s.shippingFee}
                  onChange={(e) => edit((d) => void (d.shippingFee = Number(e.target.value) || 0))}
                />
              </div>
            </div>
          </Section>

          {/* ---------- whatsapp ---------- */}
          <Section
            title="WhatsApp support"
            hint="Shows a floating chat button, and an ask-about-this link on product pages. Leave the number blank to hide both."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Number with country code</label>
                <input
                  className={inputClass}
                  placeholder="919876543210"
                  value={s.whatsappNumber}
                  onChange={(e) => edit((d) => void (d.whatsappNumber = e.target.value))}
                />
                <p className="mt-1 text-[11px] text-ash-dim">
                  Digits only — 91 then the 10-digit number, no + and no spaces.
                </p>
              </div>
              <div>
                <label className={labelClass}>Opening message</label>
                <input
                  className={inputClass}
                  value={s.whatsappMessage}
                  onChange={(e) => edit((d) => void (d.whatsappMessage = e.target.value))}
                />
                <p className="mt-1 text-[11px] text-ash-dim">
                  On a product page the product name is added to the end.
                </p>
              </div>
            </div>
          </Section>

          {/* ---------- tracking ---------- */}
          <Section
            title="Ad tracking"
            hint="Without these, Meta cannot see which ads produced sales, cannot retarget visitors, and cannot optimise your spend. Paste the IDs once."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Meta (Facebook) Pixel ID</label>
                <input
                  className={inputClass}
                  placeholder="1234567890123456"
                  value={s.metaPixelId}
                  onChange={(e) => edit((d) => void (d.metaPixelId = e.target.value))}
                />
              </div>
              <div>
                <label className={labelClass}>Google Analytics 4 ID</label>
                <input
                  className={inputClass}
                  placeholder="G-XXXXXXXXXX"
                  value={s.ga4Id}
                  onChange={(e) => edit((d) => void (d.ga4Id = e.target.value))}
                />
              </div>
            </div>
            <p className="mt-3 rounded-lg border border-edge bg-surface/40 p-3 text-[11px] leading-relaxed text-ash">
              Events sent automatically: <b className="text-chalk">PageView</b>,{" "}
              <b className="text-chalk">ViewContent</b> (product opened),{" "}
              <b className="text-chalk">AddToCart</b>,{" "}
              <b className="text-chalk">InitiateCheckout</b> and{" "}
              <b className="text-chalk">Purchase</b> — the last one reports the amount
              actually charged, after shipping and any discount.
            </p>
          </Section>

          {/* ---------- coupons ---------- */}
          <Section
            title="Discount codes"
            hint="Checked on the server, so nobody can invent a code or edit the discount in their browser. The list never appears in the page source."
          >
            <div className="space-y-3">
              {s.coupons.length === 0 && (
                <p className="text-sm text-ash">No codes yet — add one below.</p>
              )}
              {s.coupons.map((c, i) => (
                <div key={i} className="rounded-xl border border-edge bg-surface/40 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-ash">
                      <input
                        type="checkbox"
                        checked={c.active}
                        onChange={(e) => edit((d) => void (d.coupons[i].active = e.target.checked))}
                        className="accent-volt"
                      />
                      Active
                    </label>
                    <button
                      type="button"
                      onClick={() => edit((d) => void d.coupons.splice(i, 1))}
                      aria-label="Delete code"
                      className="flex h-6 w-6 items-center justify-center rounded-md border border-edge text-ash transition-colors hover:border-bad/60 hover:text-bad"
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-4">
                    <input
                      className={`${inputClass} font-mono uppercase tracking-wider`}
                      placeholder="FIRST10"
                      value={c.code}
                      onChange={(e) => edit((d) => void (d.coupons[i].code = e.target.value))}
                    />
                    <select
                      className={inputClass}
                      value={c.type}
                      onChange={(e) =>
                        edit((d) => void (d.coupons[i].type = e.target.value as Coupon["type"]))
                      }
                    >
                      <option value="percent">% off</option>
                      <option value="flat">₹ off</option>
                    </select>
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      placeholder="Amount"
                      value={c.value}
                      onChange={(e) =>
                        edit((d) => void (d.coupons[i].value = Number(e.target.value) || 0))
                      }
                    />
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      placeholder="Min order"
                      value={c.minOrder}
                      onChange={(e) =>
                        edit((d) => void (d.coupons[i].minOrder = Number(e.target.value) || 0))
                      }
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-ash-dim">
                    Code · type · amount · minimum order in ₹ (0 = no minimum)
                  </p>
                </div>
              ))}
            </div>
            <button
              className="mt-3 rounded-full border border-edge px-3.5 py-1.5 text-xs font-medium text-chalk transition-colors hover:border-volt/50 hover:text-volt"
              onClick={() =>
                edit(
                  (d) =>
                    void d.coupons.push({
                      code: "",
                      type: "percent",
                      value: 10,
                      minOrder: 0,
                      active: true,
                    }),
                )
              }
            >
              + Add code
            </button>
          </Section>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="h-10 rounded-full bg-volt px-6 text-sm font-semibold text-void shadow-[0_0_30px_-10px_var(--color-volt)] transition-colors hover:bg-volt-dim disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
        {saved && <p className="text-xs text-good">Saved.</p>}
        {error && <p className="text-xs text-bad">{error}</p>}
      </div>
    </div>
  );
}
