"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Category } from "@/lib/categories";

const inputClass =
  "h-10 w-full rounded-lg border border-edge bg-surface px-3 text-sm text-chalk outline-none transition-colors focus:border-volt placeholder:text-ash-dim";

// Admin panel: add / edit / delete / reorder the storefront categories.
// Saved as a JSON array in site_settings (key "categories") — no DB migration.
export function CategoryManager({ initial }: { initial: Category[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [cats, setCats] = useState<Category[]>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const touch = () => {
    setSaved(false);
    setError(null);
  };
  function update(i: number, key: keyof Category, val: string) {
    setCats((cs) => cs.map((c, idx) => (idx === i ? { ...c, [key]: val } : c)));
    touch();
  }
  function add() {
    setCats((cs) => [...cs, { name: "", blurb: "" }]);
    touch();
  }
  function remove(i: number) {
    setCats((cs) => cs.filter((_, idx) => idx !== i));
    touch();
  }
  function move(i: number, dir: -1 | 1) {
    setCats((cs) => {
      const j = i + dir;
      if (j < 0 || j >= cs.length) return cs;
      const copy = [...cs];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
    touch();
  }

  async function save() {
    const clean = cats
      .map((c) => ({ name: c.name.trim(), blurb: c.blurb.trim() }))
      .filter((c) => c.name);
    if (clean.length === 0) {
      setError("Add at least one category with a name.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "categories", value: JSON.stringify(clean) });
    setSaving(false);
    if (error) setError(error.message);
    else {
      setSaved(true);
      setCats(clean);
      router.refresh();
    }
  }

  return (
    <div className="rounded-2xl border border-edge bg-coal p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg font-semibold">Categories</h2>
          <p className="mt-1 text-xs text-ash">
            These show on the homepage &amp; shop filters. Reorder with ↑ ↓, edit the
            name/tagline, or remove one. Products keep the category name you type here.
          </p>
        </div>
        <button
          onClick={add}
          className="flex-shrink-0 rounded-full border border-edge px-4 py-2 text-sm font-medium text-chalk transition-colors hover:border-volt/50 hover:text-volt"
        >
          + Add
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {cats.length === 0 && (
          <p className="text-sm text-ash">No categories yet — add your first one.</p>
        )}
        {cats.map((c, i) => (
          <div key={i} className="flex items-start gap-2 rounded-xl border border-edge bg-surface/40 p-3">
            {/* reorder */}
            <div className="flex flex-col gap-1 pt-1">
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Move up"
                className="flex h-6 w-6 items-center justify-center rounded-md border border-edge text-xs text-ash transition-colors hover:text-volt disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === cats.length - 1}
                aria-label="Move down"
                className="flex h-6 w-6 items-center justify-center rounded-md border border-edge text-xs text-ash transition-colors hover:text-volt disabled:opacity-30"
              >
                ↓
              </button>
            </div>
            {/* fields */}
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              <input
                value={c.name}
                onChange={(e) => update(i, "name", e.target.value)}
                placeholder="Category name (e.g. Desk Toys)"
                className={inputClass}
              />
              <input
                value={c.blurb}
                onChange={(e) => update(i, "blurb", e.target.value)}
                placeholder="Short tagline (e.g. Fidget, spin, levitate)"
                className={inputClass}
              />
            </div>
            {/* delete */}
            <button
              onClick={() => remove(i)}
              aria-label="Delete category"
              className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-edge text-ash transition-colors hover:border-red-400/60 hover:text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="h-10 rounded-full bg-volt px-6 text-sm font-semibold text-void shadow-[0_0_30px_-10px_var(--color-volt)] transition-colors hover:bg-volt-dim disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save categories"}
        </button>
        {saved && <p className="text-xs text-emerald-400">✓ Saved — check your homepage &amp; shop.</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    </div>
  );
}
