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
