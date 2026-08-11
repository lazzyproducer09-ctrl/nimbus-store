import { supabase } from "./supabase";

// Read a single site setting (public-readable). Used for e.g. the hero image.
export async function getSetting(key: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) {
    console.error("Failed to read setting:", error.message);
    return null;
  }
  return data?.value ?? null;
}

// Read several settings in ONE query (faster than calling getSetting N times).
// Returns a plain object: { key: value | null }.
export async function getSettings(
  keys: string[],
): Promise<Record<string, string | null>> {
  const out: Record<string, string | null> = {};
  for (const k of keys) out[k] = null;
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", keys);
  if (error) {
    console.error("Failed to read settings:", error.message);
    return out;
  }
  for (const row of data ?? []) out[row.key] = row.value ?? null;
  return out;
}
