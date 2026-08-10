"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function HeroImageManager({ currentUrl }: { currentUrl: string | null }) {
  const router = useRouter();
  const supabase = createClient();
  const [url, setUrl] = useState<string | null>(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSaved(false);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `hero-${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("product-images").upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "hero_image_url", value: url });
    setSaving(false);
    if (error) setError(error.message);
    else {
      setSaved(true);
      router.refresh();
    }
  }

  async function removeImage() {
    setUrl(null);
    await supabase.from("site_settings").upsert({ key: "hero_image_url", value: null });
    setSaved(true);
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <h2 className="font-heading text-lg font-semibold">Homepage hero image</h2>
      <p className="mt-1 text-xs text-muted">
        The big photo shown on your homepage banner. Recommended: a clear, high-quality product shot.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="relative h-40 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-line bg-mist">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="hero" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-muted">
              No image
            </span>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-ink/15 px-5 text-sm font-medium transition-colors hover:border-ink/40">
            {uploading ? "Uploading…" : "Choose image"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => upload(e.target.files?.[0])}
            />
          </label>
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving || uploading}
              className="h-10 rounded-full bg-storm px-5 text-sm font-medium text-white hover:bg-storm-dark disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {url && (
              <button
                onClick={removeImage}
                className="h-10 rounded-full border border-ink/15 px-5 text-sm font-medium text-muted hover:border-red-300 hover:text-red-600"
              >
                Remove
              </button>
            )}
          </div>
          {saved && <p className="text-xs text-green-700">✓ Saved — check your homepage.</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
