import { createClient } from "./supabase/server";
import type { Product } from "./products";

// ALL products, including hidden/inactive ones — for the admin panel.
// Uses the authenticated server client so RLS returns hidden products to admins.
export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Failed to load all products:", error.message);
    return [];
  }
  return data as Product[];
}
