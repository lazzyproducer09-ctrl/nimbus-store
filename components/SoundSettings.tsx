"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { playSuccessChime, CHIME_OPTIONS, type ChimeType } from "@/lib/chime";

export function SoundSettings({
  initialEnabled,
  initialVolume,
  initialType,
}: {
  initialEnabled: boolean;
  initialVolume: number;
  initialType: ChimeType;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [volume, setVolume] = useState(initialVolume);
  const [type, setType] = useState<ChimeType>(initialType);
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
      { key: "sound_type", value: type },
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

        {/* choose which sound */}
        <div className={enabled ? "" : "pointer-events-none opacity-40"}>
          <label className="mb-1.5 block text-xs font-medium text-muted">
            Choose a sound (tap to hear it)
          </label>
          <div className="flex flex-wrap gap-2">
            {CHIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setType(opt.value);
                  setSaved(false);
                  playSuccessChime(volume, opt.value);
                }}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  type === opt.value
                    ? "border-storm bg-storm-tint text-storm"
                    : "border-line hover:border-ink/40"
                }`}
              >
                🔊 {opt.label}
              </button>
            ))}
          </div>
        </div>

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
            onClick={() => playSuccessChime(volume, type)}
            className="h-10 rounded-full border border-ink/15 px-5 text-sm font-medium transition-colors hover:border-storm hover:text-storm"
          >
            🔊 Test selected
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
