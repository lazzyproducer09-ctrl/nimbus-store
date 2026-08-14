import { getSetting } from "./settings";

// One storefront category. Stored as a JSON array in site_settings (key
// "categories"), so the admin can add / edit / reorder them without a deploy.
export type Category = {
  name: string;
  blurb: string;
};

// Sensible starter set for an offbeat store — used until the admin saves their own.
export const DEFAULT_CATEGORIES: Category[] = [
  { name: "Desk Toys", blurb: "Fidget, spin, levitate" },
  { name: "Weird Lights", blurb: "Glow up your space" },
  { name: "Gag Gifts", blurb: "Start a conversation" },
  { name: "Tech Oddities", blurb: "Gadgets that wow" },
  { name: "Home Curios", blurb: "Decor with attitude" },
  { name: "Car Cool", blurb: "Ride, upgraded" },
];

// Read the live category list (falls back to the defaults if none saved yet).
export async function getCategories(): Promise<Category[]> {
  const raw = await getSetting("categories");
  if (!raw) return DEFAULT_CATEGORIES;
  try {
    const parsed = JSON.parse(raw) as Category[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.filter((c) => c && typeof c.name === "string" && c.name.trim());
    }
  } catch {
    /* malformed — fall back to defaults */
  }
  return DEFAULT_CATEGORIES;
}
