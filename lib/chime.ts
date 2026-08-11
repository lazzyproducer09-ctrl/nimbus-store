// Success sounds generated with the Web Audio API — no audio files, no copyright.
// The admin can pick one of these from the admin panel.
export type ChimeType = "chime" | "ding" | "coin" | "fanfare";

export const CHIME_OPTIONS: { value: ChimeType; label: string }[] = [
  { value: "chime", label: "Chime" },
  { value: "ding", label: "Ding" },
  { value: "coin", label: "Coin" },
  { value: "fanfare", label: "Fanfare" },
];

type Note = { freq: number; at: number; dur: number; type?: OscillatorType };

// Each sound is just a small set of notes (frequency, start time, duration).
const SOUNDS: Record<ChimeType, Note[]> = {
  // gentle rising bells — C5 · E5 · G5
  chime: [
    { freq: 523.25, at: 0, dur: 0.35 },
    { freq: 659.25, at: 0.12, dur: 0.35 },
    { freq: 783.99, at: 0.24, dur: 0.4 },
  ],
  // a single bright notification "ding" (two tones together)
  ding: [
    { freq: 880, at: 0, dur: 0.5 },
    { freq: 1318.51, at: 0.0, dur: 0.5 },
  ],
  // quick "cha-ching" coin blip
  coin: [
    { freq: 987.77, at: 0, dur: 0.09, type: "square" },
    { freq: 1318.51, at: 0.07, dur: 0.28, type: "square" },
  ],
  // a fuller little fanfare — C5 · E5 · G5 · C6
  fanfare: [
    { freq: 523.25, at: 0, dur: 0.18 },
    { freq: 659.25, at: 0.12, dur: 0.18 },
    { freq: 783.99, at: 0.24, dur: 0.18 },
    { freq: 1046.5, at: 0.36, dur: 0.45 },
  ],
};

export function playSuccessChime(volume: number, type: ChimeType = "chime") {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    void ctx.resume?.();

    const now = ctx.currentTime;
    const base = Math.max(0, Math.min(1, volume)) * 0.25;
    const notes = SOUNDS[type] ?? SOUNDS.chime;

    for (const n of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = n.type ?? "sine";
      osc.frequency.value = n.freq;
      // square waves are harsher — trim them a bit.
      const level = n.type === "square" ? base * 0.6 : base;
      const start = now + n.at;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.linearRampToValueAtTime(level, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + n.dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + n.dur + 0.05);
    }
  } catch {
    /* audio not available — silently skip */
  }
}
