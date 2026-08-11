import { supabase } from "./supabase";

// The shape of one product row, matching our database table.
export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category: string;
  sizes: string[];
  colors: string[];
  images: string[];
  video_url: string | null;
  stock: number;
  rating: number;
  review_count: number;
  tag: string | null;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

// Fetch the products marked as "featured" (for the homepage bestsellers row).
export async function getFeaturedProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .limit(4);

  if (error) {
    console.error("Failed to load featured products:", error.message);
    return [];
  }
  return data as Product[];
}

// The categories we sell (used by the shop filters and homepage tiles).
export const CATEGORIES = [
  "Raincoats",
  "Umbrellas",
  "Rain Boots",
  "Accessories",
] as const;

// The sort options offered on the shop page.
export type SortOption = "newest" | "price-asc" | "price-desc" | "rating";

// Fetch products for the shop page, applying an optional category filter,
// search text, and sort order. Everything happens in the database (fast).
// Sort a list of products in JS (used for search results).
function sortProducts(list: Product[], sort?: SortOption): Product[] {
  const copy = [...list];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    default:
      return copy; // keep relevance (search) or DB order
  }
}

export async function getProducts(opts: {
  category?: string;
  q?: string;
  sort?: SortOption;
} = {}): Promise<Product[]> {
  // Smart, typo-tolerant search when there's a query.
  if (opts.q && opts.q.trim()) {
    const { data, error } = await supabase.rpc("search_products", {
      search_query: opts.q.trim(),
    });
    if (error) {
      console.error("Search failed:", error.message);
      return [];
    }
    let results = (data ?? []) as Product[];
    if (opts.category) results = results.filter((p) => p.category === opts.category);
    // For search, keep relevance order unless a sort is explicitly picked.
    return opts.sort && opts.sort !== "newest" ? sortProducts(results, opts.sort) : results;
  }

  // No search query → normal filtered browse.
  let query = supabase.from("products").select("*").eq("is_active", true);
  if (opts.category) query = query.eq("category", opts.category);

  switch (opts.sort) {
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    default:
      query = query.order("sort_order", { ascending: true });
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to load products:", error.message);
    return [];
  }
  return data as Product[];
}

// Similar products for the product detail page: same category, excluding this one.
export async function getSimilarProducts(
  category: string,
  excludeId: string,
): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("category", category)
    .neq("id", excludeId)
    .order("sort_order", { ascending: true })
    .limit(4);
  if (error) {
    console.error("Failed to load similar products:", error.message);
    return [];
  }
  return data as Product[];
}

// Fetch a single product by its slug (for the product detail page).
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to load product:", error.message);
    return null;
  }
  return data as Product | null;
}
