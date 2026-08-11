"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { playSuccessChime } from "@/lib/chime";

export function SoundSettings({
  initialEnabled,
  initialVolume,
}: {
  initialEnabled: boolean;
  initialVolume: number;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [volume, setVolume] = useState(initialVolume);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error } = await supabase.from("site_settings").upsert([
      { key: "sound_enabled", value: enabled ? "true" : "false" },
      { key: "sound_volume", value: String(volume) },
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
      <h2 className="font-heading text-lg font-semibold">Order success sound</h2>
      <p className="mt-1 text-xs text-muted">
        A short chime that plays for the customer when their payment succeeds.
      </p>

      <div className="mt-4 space-y-4">
        {/* on / off */}
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => {
              setEnabled(e.target.checked);
              setSaved(false);
            }}
            className="h-5 w-5 accent-storm"
          />
          <span className="font-medium">Play a sound on successful payment</span>
        </label>

        {/* volume */}
        <div className={enabled ? "" : "pointer-events-none opacity-40"}>
          <label className="mb-1 block text-xs font-medium text-muted">
            Volume: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setSaved(false);
            }}
            className="w-full max-w-xs accent-storm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => playSuccessChime(volume)}
            className="h-10 rounded-full border border-ink/15 px-5 text-sm font-medium transition-colors hover:border-storm hover:text-storm"
          >
            🔊 Test sound
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="h-10 rounded-full bg-storm px-6 text-sm font-medium text-white hover:bg-storm-dark disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {saved && <p className="text-xs text-green-700">✓ Saved.</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>
    </div>
  );
}
