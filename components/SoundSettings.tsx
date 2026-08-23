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
    <div className="rounded-2xl border border-edge bg-coal p-6">
      <h2 className="font-heading text-lg font-semibold">Order success sound</h2>
      <p className="mt-1 text-xs text-ash">
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
            className="h-5 w-5 accent-volt"
          />
          <span className="font-medium">Play a sound on successful payment</span>
        </label>

        {/* choose which sound */}
        <div className={enabled ? "" : "pointer-events-none opacity-40"}>
          <label className="mb-1.5 block text-xs font-medium text-ash">
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
                    ? "border-volt bg-volt-deep text-volt"
                    : "border-edge hover:border-edge"
                }`}
              >
                🔊 {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* volume */}
        <div className={enabled ? "" : "pointer-events-none opacity-40"}>
          <label className="mb-1 block text-xs font-medium text-ash">
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
            className="w-full max-w-xs accent-volt"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => playSuccessChime(volume, type)}
            className="h-10 rounded-full border border-edge px-5 text-sm font-medium transition-colors hover:border-volt hover:text-volt"
          >
            🔊 Test selected
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="h-10 rounded-full bg-volt px-6 text-sm font-medium text-void hover:bg-volt-dim disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          {saved && <p className="text-xs text-good">✓ Saved.</p>}
          {error && <p className="text-xs text-bad">{error}</p>}
        </div>
      </div>
    </div>
  );
}
