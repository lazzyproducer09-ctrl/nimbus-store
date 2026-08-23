"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_CONTENT, type SiteContent } from "@/lib/site-content";
import { ICON_NAMES, iconByName, CloseIcon, type IconName } from "./icons";

// ---------------------------------------------------------------------------
// Admin → Storefront content.
//
// Edits every piece of customer-facing copy on the homepage, the announcement
// bar and the footer, then saves the whole thing as one JSON blob in
// site_settings. Mirrors how CategoryManager works.
// ---------------------------------------------------------------------------

const inputClass =
  "h-10 w-full rounded-lg border border-edge bg-surface px-3 text-sm text-chalk outline-none transition-colors focus:border-volt placeholder:text-ash-dim";
const areaClass =
  "w-full rounded-lg border border-edge bg-surface px-3 py-2 text-sm leading-relaxed text-chalk outline-none transition-colors focus:border-volt placeholder:text-ash-dim";
const labelClass = "mb-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-ash";

function Field({
  label,
  value,
  onChange,
  placeholder,
  area = false,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  area?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {area ? (
        <textarea
          className={areaClass}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={inputClass}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

// Icon picker — shows the actual glyph so you choose by sight, not by name.
function IconPicker({ value, onChange }: { value: IconName; onChange: (v: IconName) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ICON_NAMES.map((n) => {
        const Icon = iconByName(n);
        const on = n === value;
        return (
          <button
            key={n}
            type="button"
            title={n}
            aria-label={n}
            aria-pressed={on}
            onClick={() => onChange(n)}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
              on
                ? "border-volt bg-volt-deep text-volt"
                : "border-edge text-ash hover:border-volt/50 hover:text-chalk"
            }`}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-edge-soft pt-6 first:border-0 first:pt-0">
      <h3 className="font-heading text-sm font-semibold text-chalk">{title}</h3>
      <p className="mt-0.5 mb-4 text-xs text-ash">{hint}</p>
      {children}
    </section>
  );
}

// Small header for a repeatable row, with a remove button.
function RowHead({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ash-dim">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="flex h-6 w-6 items-center justify-center rounded-md border border-edge text-ash transition-colors hover:border-bad/60 hover:text-bad"
      >
        <CloseIcon className="h-3 w-3" />
      </button>
    </div>
  );
}

const addBtn =
  "rounded-full border border-edge px-3.5 py-1.5 text-xs font-medium text-chalk transition-colors hover:border-volt/50 hover:text-volt";

export function ContentManager({ initial }: { initial: SiteContent }) {
  const router = useRouter();
  const supabase = createClient();
  const [c, setC] = useState<SiteContent>(initial);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Every edit funnels through here so the "saved" flag always resets.
  function edit(fn: (draft: SiteContent) => void) {
    setC((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
    setSaved(false);
    setError(null);
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "site_content", value: JSON.stringify(c) });
    setSaving(false);
    if (error) setError(error.message);
    else {
      setSaved(true);
      router.refresh();
    }
  }

  function resetAll() {
    edit((d) => Object.assign(d, structuredClone(DEFAULT_CONTENT)));
  }

  return (
    <div className="rounded-2xl border border-edge bg-coal p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Storefront content</h2>
          <p className="mt-1 text-xs text-ash">
            Every line of text on the homepage, the announcement bar and the footer.
            Change it here — no code, no redeploy.
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
          {/* ---------- announcement bar ---------- */}
          <Section
            title="Announcement bar"
            hint="The thin rotating strip above the header. Each message shows for ~3.5 seconds."
          >
            <div className="space-y-3">
              {c.announcements.map((a, i) => (
                <div key={i} className="rounded-xl border border-edge bg-surface/40 p-3">
                  <RowHead
                    label={`Message ${i + 1}`}
                    onRemove={() => edit((d) => void d.announcements.splice(i, 1))}
                  />
                  <input
                    className={inputClass}
                    value={a.text}
                    onChange={(e) => edit((d) => void (d.announcements[i].text = e.target.value))}
                  />
                  <div className="mt-2">
                    <IconPicker
                      value={a.icon}
                      onChange={(v) => edit((d) => void (d.announcements[i].icon = v))}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              className={`mt-3 ${addBtn}`}
              onClick={() => edit((d) => void d.announcements.push({ icon: "spark", text: "" }))}
            >
              + Add message
            </button>
          </Section>

          {/* ---------- hero ---------- */}
          <Section title="Hero" hint="The big opening block — the first thing anyone sees.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Eyebrow label"
                value={c.hero.eyebrow}
                onChange={(v) => edit((d) => void (d.hero.eyebrow = v))}
              />
              <Field
                label="Headline line 1"
                value={c.hero.line1}
                onChange={(v) => edit((d) => void (d.hero.line1 = v))}
              />
              <Field
                label="Headline line 2"
                value={c.hero.line2}
                onChange={(v) => edit((d) => void (d.hero.line2 = v))}
              />
              <Field
                label="Underlined word"
                value={c.hero.accent}
                onChange={(v) => edit((d) => void (d.hero.accent = v))}
                placeholder="gets the marker stroke"
              />
            </div>
            <div className="mt-3">
              <Field
                label="Sub-headline"
                area
                value={c.hero.sub}
                onChange={(v) => edit((d) => void (d.hero.sub = v))}
              />
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field
                label="Primary button"
                value={c.hero.ctaPrimary}
                onChange={(v) => edit((d) => void (d.hero.ctaPrimary = v))}
              />
              <Field
                label="Secondary button"
                value={c.hero.ctaSecondary}
                onChange={(v) => edit((d) => void (d.hero.ctaSecondary = v))}
              />
              <Field
                label="Image corner label"
                value={c.hero.frameBadge}
                onChange={(v) => edit((d) => void (d.hero.frameBadge = v))}
              />
              <Field
                label="Caption under image"
                value={c.hero.frameCaption}
                onChange={(v) => edit((d) => void (d.hero.frameCaption = v))}
              />
            </div>
          </Section>

          {/* ---------- specs ---------- */}
          <Section
            title="Spec strip"
            hint="The three short facts under the hero buttons. Keep these true — they are promises."
          >
            <div className="space-y-3">
              {c.specs.map((s, i) => (
                <div key={i} className="rounded-xl border border-edge bg-surface/40 p-3">
                  <RowHead label={`Spec ${i + 1}`} onRemove={() => edit((d) => void d.specs.splice(i, 1))} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      className={inputClass}
                      placeholder="48 hrs"
                      value={s.value}
                      onChange={(e) => edit((d) => void (d.specs[i].value = e.target.value))}
                    />
                    <input
                      className={inputClass}
                      placeholder="Order dispatch"
                      value={s.label}
                      onChange={(e) => edit((d) => void (d.specs[i].label = e.target.value))}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              className={`mt-3 ${addBtn}`}
              onClick={() => edit((d) => void d.specs.push({ value: "", label: "" }))}
            >
              + Add spec
            </button>
          </Section>

          {/* ---------- trust ---------- */}
          <Section
            title="Trust strip"
            hint="The shipping / returns / payment row. Shown under the hero and again at the bottom."
          >
            <div className="space-y-3">
              {c.trust.map((t, i) => (
                <div key={i} className="rounded-xl border border-edge bg-surface/40 p-3">
                  <RowHead label={`Point ${i + 1}`} onRemove={() => edit((d) => void d.trust.splice(i, 1))} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      className={inputClass}
                      placeholder="Free shipping"
                      value={t.title}
                      onChange={(e) => edit((d) => void (d.trust[i].title = e.target.value))}
                    />
                    <input
                      className={inputClass}
                      placeholder="on orders over ₹999"
                      value={t.sub}
                      onChange={(e) => edit((d) => void (d.trust[i].sub = e.target.value))}
                    />
                  </div>
                  <div className="mt-2">
                    <IconPicker value={t.icon} onChange={(v) => edit((d) => void (d.trust[i].icon = v))} />
                  </div>
                </div>
              ))}
            </div>
            <button
              className={`mt-3 ${addBtn}`}
              onClick={() => edit((d) => void d.trust.push({ icon: "check", title: "", sub: "" }))}
            >
              + Add point
            </button>
          </Section>

          {/* ---------- section headings ---------- */}
          <Section title="Section headings" hint="Titles above the product grid, the category grid, and the scrolling band.">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Bestsellers — eyebrow"
                value={c.bestsellers.eyebrow}
                onChange={(v) => edit((d) => void (d.bestsellers.eyebrow = v))}
              />
              <Field
                label="Bestsellers — title"
                value={c.bestsellers.title}
                onChange={(v) => edit((d) => void (d.bestsellers.title = v))}
              />
              <Field
                label="Categories — eyebrow"
                value={c.categories.eyebrow}
                onChange={(v) => edit((d) => void (d.categories.eyebrow = v))}
              />
              <Field
                label="Categories — title"
                value={c.categories.title}
                onChange={(v) => edit((d) => void (d.categories.title = v))}
              />
            </div>
            <div className="mt-3">
              <Field
                label="Scrolling band text"
                value={c.marquee}
                onChange={(v) => edit((d) => void (d.marquee = v))}
              />
            </div>
          </Section>

          {/* ---------- house rules ---------- */}
          <Section
            title="House rules"
            hint="Your point of view, in place of testimonials. Only put real customer quotes here once you actually have them."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Eyebrow"
                value={c.houseRules.eyebrow}
                onChange={(v) => edit((d) => void (d.houseRules.eyebrow = v))}
              />
              <Field
                label="Title (Enter for a line break)"
                area
                rows={2}
                value={c.houseRules.title}
                onChange={(v) => edit((d) => void (d.houseRules.title = v))}
              />
            </div>
            <div className="mt-3 space-y-3">
              {c.houseRules.items.map((r, i) => (
                <div key={i} className="rounded-xl border border-edge bg-surface/40 p-3">
                  <RowHead
                    label={`Rule ${String(i + 1).padStart(2, "0")}`}
                    onRemove={() => edit((d) => void d.houseRules.items.splice(i, 1))}
                  />
                  <input
                    className={inputClass}
                    placeholder="Rule title"
                    value={r.title}
                    onChange={(e) => edit((d) => void (d.houseRules.items[i].title = e.target.value))}
                  />
                  <textarea
                    className={`${areaClass} mt-2`}
                    rows={2}
                    placeholder="One or two sentences"
                    value={r.body}
                    onChange={(e) => edit((d) => void (d.houseRules.items[i].body = e.target.value))}
                  />
                </div>
              ))}
            </div>
            <button
              className={`mt-3 ${addBtn}`}
              onClick={() => edit((d) => void d.houseRules.items.push({ title: "", body: "" }))}
            >
              + Add rule
            </button>
          </Section>

          {/* ---------- closing + footer ---------- */}
          <Section title="Closing block & footer" hint="The last push before the footer, and the short blurb under the logo.">
            <div className="grid gap-3">
              <Field
                label="Closing title"
                value={c.closing.title}
                onChange={(v) => edit((d) => void (d.closing.title = v))}
              />
              <Field
                label="Closing paragraph"
                area
                value={c.closing.body}
                onChange={(v) => edit((d) => void (d.closing.body = v))}
              />
              <Field
                label="Footer blurb"
                area
                value={c.footerBlurb}
                onChange={(v) => edit((d) => void (d.footerBlurb = v))}
              />
            </div>
          </Section>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="h-10 rounded-full bg-volt px-6 text-sm font-semibold text-void shadow-[0_0_30px_-10px_var(--color-volt)] transition-colors hover:bg-volt-dim disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save content"}
        </button>
        {open && (
          <button
            onClick={resetAll}
            className="h-10 rounded-full border border-edge px-4 text-sm font-medium text-ash transition-colors hover:border-bad/60 hover:text-bad"
          >
            Reset to defaults
          </button>
        )}
        {saved && <p className="text-xs text-good">✓ Saved — reload the homepage to see it.</p>}
        {error && <p className="text-xs text-bad">{error}</p>}
      </div>
    </div>
  );
}
