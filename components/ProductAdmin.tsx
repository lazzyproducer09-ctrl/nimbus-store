"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, type Product } from "@/lib/products";
import { inr } from "@/lib/format";
import { ConfirmDialog } from "./ConfirmDialog";
import { UmbrellaMark } from "./icons";

type FormState = {
  name: string;
  price: string;
  compare_at_price: string;
  category: string;
  description: string;
  stock: string;
  sizes: string;
  colors: string;
  images: string[];
  video_url: string | null;
  is_featured: boolean;
  is_active: boolean;
};

const EMPTY: FormState = {
  name: "",
  price: "",
  compare_at_price: "",
  category: CATEGORIES[0],
  description: "",
  stock: "0",
  sizes: "",
  colors: "",
  images: [],
  video_url: null,
  is_featured: false,
  is_active: true,
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const parseList = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

const inputClass =
  "h-10 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-storm";
const labelClass = "mb-1 block text-xs font-medium text-muted";

export function ProductAdmin({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter();
  const supabase = createClient();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function openAdd() {
    setForm(EMPTY);
    setEditingId(null);
    setError(null);
    setShowForm(true);
  }
  function openEdit(p: Product) {
    setForm({
      name: p.name,
      price: String(p.price),
      compare_at_price: p.compare_at_price ? String(p.compare_at_price) : "",
      category: p.category,
      description: p.description ?? "",
      stock: String(p.stock),
      sizes: p.sizes.join(", "),
      colors: p.colors.join(", "),
      images: p.images ?? [],
      video_url: p.video_url ?? null,
      is_featured: p.is_featured,
      is_active: p.is_active,
    });
    setEditingId(p.id);
    setError(null);
    setShowForm(true);
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage.from("product-images").upload(path, file);
        if (error) throw error;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      set("images", [...form.images, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleVideoUpload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    setError(null);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `video-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      set("video_url", data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Video upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const price = parseInt(form.price, 10);
      if (form.name.trim().length < 2) throw new Error("Please enter a product name.");
      if (isNaN(price) || price < 0) throw new Error("Please enter a valid price.");

      const payload = {
        name: form.name.trim(),
        slug: slugify(form.name),
        description: form.description.trim() || null,
        price,
        compare_at_price: form.compare_at_price ? parseInt(form.compare_at_price, 10) : null,
        category: form.category,
        sizes: parseList(form.sizes),
        colors: parseList(form.colors),
        images: form.images,
        video_url: form.video_url,
        stock: parseInt(form.stock, 10) || 0,
        is_featured: form.is_featured,
        is_active: form.is_active,
      };

      if (editingId) {
        const { error } = await supabase.from("products").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const nextOrder = initialProducts.reduce((max, p) => Math.max(max, p.sort_order), -1) + 1;
        const { error } = await supabase.from("products").insert({ ...payload, sort_order: nextOrder });
        if (error) throw error;
      }
      setShowForm(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save product.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Product) {
    await supabase.from("products").delete().eq("id", p.id);
    setPendingDelete(null);
    router.refresh();
  }

  const [reordering, setReordering] = useState<string | null>(null);

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= initialProducts.length) return;
    const a = initialProducts[index];
    const b = initialProducts[target];
    setReordering(a.id);
    await Promise.all([
      supabase.from("products").update({ sort_order: b.sort_order }).eq("id", a.id),
      supabase.from("products").update({ sort_order: a.sort_order }).eq("id", b.id),
    ]);
    setReordering(null);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{initialProducts.length} products</p>
        {!showForm && (
          <button
            onClick={openAdd}
            className="h-10 rounded-full bg-storm px-5 text-sm font-medium text-white transition-colors hover:bg-storm-dark"
          >
            + Add product
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={save} className="mt-4 space-y-3 rounded-2xl border border-line bg-white p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Name</label>
              <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Price (₹)</label>
              <input type="number" className={inputClass} value={form.price} onChange={(e) => set("price", e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Compare price (₹)</label>
              <input type="number" className={inputClass} value={form.compare_at_price} onChange={(e) => set("compare_at_price", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Stock</label>
              <input type="number" className={inputClass} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-storm"
              rows={3}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Sizes (comma-separated)</label>
              <input className={inputClass} placeholder="S, M, L, XL" value={form.sizes} onChange={(e) => set("sizes", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Colours (comma-separated)</label>
              <input className={inputClass} placeholder="Storm Blue, Charcoal" value={form.colors} onChange={(e) => set("colors", e.target.value)} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Photos</label>
            <div className="flex flex-wrap gap-2">
              {form.images.map((url, i) => (
                <div key={i} className="relative h-16 w-14 overflow-hidden rounded-lg border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => set("images", form.images.filter((_, idx) => idx !== i))}
                    className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-bl bg-black/60 text-[10px] text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <label className="flex h-16 w-14 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line text-lg text-muted hover:border-storm">
                {uploading ? "…" : "+"}
                <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
              </label>
            </div>
          </div>

          <div>
            <label className={labelClass}>Product video (optional)</label>
            {form.video_url ? (
              <div className="flex items-center gap-3">
                <video src={form.video_url} className="h-16 w-28 rounded-lg border border-line object-cover" muted />
                <button
                  type="button"
                  onClick={() => set("video_url", null)}
                  className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-red-300 hover:text-red-600"
                >
                  Remove video
                </button>
              </div>
            ) : (
              <label className="flex h-16 w-28 cursor-pointer items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted hover:border-storm">
                {uploadingVideo ? "Uploading…" : "+ Add video"}
                <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoUpload(e.target.files)} />
              </label>
            )}
          </div>

          <div className="flex gap-6 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => set("is_featured", e.target.checked)} /> Featured
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} /> Active (visible in store)
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving || uploading || uploadingVideo}
              className="h-10 rounded-full bg-storm px-5 text-sm font-medium text-white transition-colors hover:bg-storm-dark disabled:opacity-50"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "Add product"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="h-10 rounded-full border border-ink/15 px-5 text-sm font-medium transition-colors hover:border-ink/40"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <p className="mt-4 text-xs text-muted">
        Order below = order on the shop page &amp; homepage. Use ↑ / ↓ to reorder.
      </p>
      <div className="mt-2 space-y-2">
        {initialProducts.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3">
            <div className="flex flex-shrink-0 flex-col">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0 || reordering !== null}
                className="flex h-6 w-6 items-center justify-center rounded text-muted transition-colors hover:bg-mist hover:text-ink disabled:opacity-25"
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === initialProducts.length - 1 || reordering !== null}
                className="flex h-6 w-6 items-center justify-center rounded text-muted transition-colors hover:bg-mist hover:text-ink disabled:opacity-25"
                aria-label="Move down"
              >
                ↓
              </button>
            </div>
            <div className="h-14 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-line bg-mist">
              {p.images?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full items-center justify-center text-storm/30">
                  <UmbrellaMark className="h-5 w-5" />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-medium">{p.name}</p>
                {p.is_featured && (
                  <span className="rounded-full bg-storm-tint px-2 py-0.5 text-[10px] font-medium text-storm">
                    Featured
                  </span>
                )}
                {!p.is_active && (
                  <span className="rounded-full bg-mist px-2 py-0.5 text-[10px] font-medium text-muted">
                    Hidden
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {p.category} · {inr(p.price)} ·{" "}
                <span className={p.stock === 0 ? "font-medium text-red-600" : p.stock < 10 ? "font-medium text-amber-600" : ""}>
                  {p.stock} in stock
                </span>
              </p>
            </div>
            <button
              onClick={() => openEdit(p)}
              className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-ink/40 hover:text-ink"
            >
              Edit
            </button>
            <button
              onClick={() => setPendingDelete(p)}
              className="rounded-full border border-line px-3 py-1 text-xs font-medium text-muted transition-colors hover:border-red-300 hover:text-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete product?"
        message={`Permanently delete "${pendingDelete?.name}"?`}
        confirmLabel="Delete"
        onConfirm={() => pendingDelete && remove(pendingDelete)}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
