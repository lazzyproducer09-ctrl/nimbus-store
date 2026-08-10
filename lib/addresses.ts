import { createClient } from "./supabase/server";

export type Address = {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
  created_at: string;
};

// Fetch the logged-in user's saved addresses (default first).
export async function getMyAddresses(): Promise<Address[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load addresses:", error.message);
    return [];
  }
  return data as Address[];
}
