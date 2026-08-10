import { createClient } from "@supabase/supabase-js";

// This is our connection to the Supabase database.
// It uses the PUBLIC key, so it can only read what Row Level Security allows.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
