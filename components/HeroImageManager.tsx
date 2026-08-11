"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function HeroImageManager({
  currentUrl,
  currentVideoUrl,
}: {
  currentUrl: string | null;
  currentVideoUrl: string | null;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [url, setUrl] = useState<string | null>(currentUrl);
  const [videoUrl, setVideoUrl] = useState<string | null>(currentVideoUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function uploadFile(file: File, prefix: string) {
    const ext = file.name.split(".").pop() || "bin";
    const path = `${prefix}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    setSaved(false);
    try {
      setUrl(await uploadFile(file, "hero"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function uploadVideo(file: File | undefined) {
    if (!file) return;
    setUploadingVideo(true);
    setError(null);
    setSaved(false);
    try {
      setVideoUrl(await uploadFile(file, "hero-video"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Video upload failed.");
    } finally {
      setUploadingVideo(false);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error } = await supabase.from("site_settings").upsert([
      { key: "hero_image_url", value: url },
      { key: "hero_video_url", value: videoUrl },
    ]);
    setSaving(false);
    if (error) setError(error.message);
    else {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-6">
      <h2 className="font-heading text-lg font-semibold">Homepage hero</h2>
      <p className="mt-1 text-xs text-muted">
        The big visual on your homepage banner. A <strong>video</strong> plays automatically
        (looped, muted) — if set, it&rsquo;s shown instead of the image.
      </p>

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        {/* ---- image ---- */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Hero image</p>
          <div className="flex flex-wrap items-start gap-4">
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
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0])} />
              </label>
              {url && (
                <button
                  onClick={() => setUrl(null)}
                  className="h-9 rounded-full border border-ink/15 px-4 text-xs font-medium text-muted hover:border-red-300 hover:text-red-600"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ---- video ---- */}
        <div>
          <p className="mb-2 text-xs font-medium text-muted">Hero video (optional)</p>
          <div className="flex flex-wrap items-start gap-4">
            <div className="relative h-40 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-line bg-mist">
              {videoUrl ? (
                <video src={videoUrl} className="h-full w-full object-cover" muted autoPlay loop playsInline />
              ) : (
                <span className="flex h-full items-center justify-center text-center text-xs text-muted">
                  No video
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <label className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-ink/15 px-5 text-sm font-medium transition-colors hover:border-ink/40">
                {uploadingVideo ? "Uploading…" : "Choose video"}
                <input type="file" accept="video/*" className="hidden" onChange={(e) => uploadVideo(e.target.files?.[0])} />
              </label>
              {videoUrl && (
                <button
                  onClick={() => setVideoUrl(null)}
                  className="h-9 rounded-full border border-ink/15 px-4 text-xs font-medium text-muted hover:border-red-300 hover:text-red-600"
                >
                  Remove video
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving || uploading || uploadingVideo}
          className="h-10 rounded-full bg-storm px-6 text-sm font-medium text-white hover:bg-storm-dark disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save hero"}
        </button>
        {saved && <p className="text-xs text-green-700">✓ Saved — check your homepage.</p>}
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
}
